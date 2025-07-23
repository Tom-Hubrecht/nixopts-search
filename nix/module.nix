# SPDX-FileCopyrightText: 2025 Tom Hubrecht <tom.hubrecht@dgnum.eu>
#
# SPDX-License-Identifier: EUPL-1.2

{
  lib,
  config,
  pkgs,
  ...
}:

let
  inherit (lib)
    attrNames
    concatStringsSep
    escapeXML
    evalModules
    filter
    flip
    getAttr
    hasPrefix
    head
    listToAttrs
    literalExpression
    mapAttrs
    mapAttrsToList
    mkDefault
    mkEnableOption
    mkIf
    mkOption
    nameValuePair
    optionAttrSetToDocList
    optional
    optionalAttrs
    optionalString
    pathIsDirectory
    pipe
    removeAttrs
    removePrefix
    removeSuffix
    warn
    ;

  inherit (lib.strings)
    sanitizeDerivationName
    ;

  inherit (lib.types)
    attrs
    attrsOf
    deferredModule
    ints
    listOf
    path
    submodule
    str
    ;

  mkDocJSON =
    module:
    {
      dependencies,
      origins,
      paths,
      specialArgs,
      ...
    }:
    let
      # NOTE: A big simplification of nixpkgs' make-options-doc
      # It turns out that we only need the json output, and have
      # no `baseOptionsJSON`, so the transformation done is `id`
      mkOpts = (flip pipe) [
        # Evaluate the modules
        (
          modules:
          evalModules {
            inherit specialArgs;
            modules = modules ++ [
              { _module.check = mkDefault false; }
            ];
          }
        )
        # Extract the options
        (getAttr "options")
        # Transform into a list of options
        optionAttrSetToDocList
        # Remove invisible and internal options
        (filter (o: o.visible && !o.internal))
        # Remove extraneous attributes
        (builtins.map (
          o:
          nameValuePair o.name (
            removeAttrs o [
              "internal"
              "loc"
              "name"
              "visible"
            ]
          )
        ))
        # Transform back to an attribute set
        listToAttrs
      ];

      # INFO: Subtract options of the ignored modules from
      #       the complete set of options
      ignored = attrNames (mkOpts dependencies);
      options = removeAttrs (mkOpts (paths ++ dependencies)) ignored;

      directories = builtins.map (getAttr "base") origins;

      mkTranslation =
        path:
        let
          # Get the file associated to the module
          file = if pathIsDirectory path then path + "/default.nix" else path;

          # Get the parent module set
          matching = filter (m: hasPrefix m.base path) origins;
          parent = head matching;
          filePath = removePrefix parent.base file;
        in
        if matching == [ ] then
          (throw "${file} is not a descendant of ${module}. Declared parents are: \n  ${concatStringsSep "\n  " directories}")
        else
          {
            name = "<${filePath}>";
            url = "${parent.url}/${filePath}";
          };
    in
    pkgs.runCommand "options-${module}"
      {
        fileName = sanitizeDerivationName "${module}.json";
        nativeBuildInputs =
          [
            (pkgs.python3.withPackages (ps: [ ps.markdown ]))
          ]
          ++ (optional cfg.compression.brotli.enable pkgs.brotli)
          ++ (optional cfg.compression.gzip.enable pkgs.gzip);

        passAsFile = [ "result" ];
        result = builtins.toJSON (
          mapAttrsToList (
            title:
            {
              default ? null,
              description,
              example ? null,
              readOnly,
              type,
              declarations,
              ...
            }:
            if (description == null) then
              (throw "${title} has no description")
            else
              let
                warnOnContext =
                  kind: text:
                  if (builtins.hasContext text) then
                    warn "Context found in the '${kind}' field of the ${title} option of ${module}: \n${text}" (
                      builtins.unsafeDiscardStringContext text
                    )
                  else
                    text;
              in
              {
                inherit
                  description
                  readOnly
                  type
                  ;

                # Sanitize
                title = escapeXML title;
                declarations = builtins.map mkTranslation declarations;
              }
              // (optionalAttrs (default != null) {
                default = warnOnContext "default" default.text;
              })
              // (optionalAttrs (example != null) {
                example = warnOnContext "example" example.text;
              })
          ) options
        );
      }
      ''
        mkdir -p $out
        python ${./build.py} $resultPath $out/$fileName
        ${optionalString cfg.compression.brotli.enable # bash
          ''
            brotli --keep --quality=${toString cfg.compression.brotli.compressionLevel} --output="$out/$fileName.br" "$out/$fileName"
          ''
        }
        ${optionalString cfg.compression.gzip.enable # bash
          ''
            gzip -c -${toString cfg.compression.gzip.compressionLevel} "$out/$fileName" > "$out/$fileName.gz"
          ''
        }
      '';

  cfg = config.services.nixopts-search;
in

{
  options.services.nixopts-search = {
    enable = mkEnableOption "NixOpts Search, a static website to expose modules documentation";

    host = mkOption {
      type = str;
      description = ''
        Domain whe NixOpts is served.
      '';
    };

    compression = {
      brotli = {
        enable = mkEnableOption "compressing the data files with the brotli algorithm";
        compressionLevel = mkOption {
          type = ints.between 0 11;
          default = 11;
          description = ''
            Brotli compression level.
          '';
        };
      };

      gzip = {
        enable = mkEnableOption "compressing the data files with the gzip algorithm";
        compressionLevel = mkOption {
          type = ints.between 0 9;
          default = 9;
          description = ''
            Gzip compression level.
          '';
        };
      };
    };

    modules = mkOption {
      type = attrsOf (
        submodule (
          { name, ... }:
          {
            options = {
              title = mkOption {
                type = str;
                default = name;
                defaultText = literalExpression "name";
                description = ''
                  Title of the module.
                '';
              };

              specialArgs = mkOption {
                type = attrs;
                default = { };
                description = ''
                  Special arguments to give to evalModules.
                '';
              };

              paths = mkOption {
                type = listOf deferredModule;
                description = ''
                  Modules to from which to document options.
                '';
              };

              dependencies = mkOption {
                type = listOf deferredModule;
                default = [ ];
                description = ''
                  Modules required to make modules of `paths` valid, however, their options will not appear in the results.
                '';
                example = literalExpression ''
                  import "''${infra-modulesPath}/module-list.nix"
                '';
              };

              origins = mkOption {
                type = listOf (submodule {
                  options = {
                    base = mkOption {
                      type = path;
                      description = ''
                        Base path of some module files to be documented.
                      '';
                      apply = v: "${removeSuffix "/" (builtins.toString v)}/";
                    };
                    url = mkOption {
                      type = str;
                      description = ''
                        Url root to use for files on this path.
                      '';
                      apply = removeSuffix "/";
                    };
                  };
                });
                description = ''
                  Rules to convert file paths to urls in the documentation to indicate where
                  the option is declared.
                '';
              };
            };
          }
        )
      );
      description = ''
        Sets of modules to be documented separately. The identifier to give for
        `settings.params.release_current_stable` (which is the default module shown) is the key after
        passing through `sanitizeDerivationName`.
      '';
    };

    defaultSet = mkOption {
      type = str;
      default = head (attrNames cfg.modules);
      defaultText = literalExpression "head (attrNames config.services.nixopts-search.modules)";
      description = ''
        The main module to show when loading the website.
      '';
      apply = sanitizeDerivationName;
    };

    links = mkOption {
      type = attrsOf str;
      default = {
        "NixOpts" = "https://github.com/Tom-Hubrecht/nixopts-search";
      };
      description = ''
        Links that will appear in the NavBar of the website.
      '';
    };
  };

  config = mkIf cfg.enable {
    services = {
      nginx =
        {
          enable = true;
          virtualHosts.${cfg.host} = {

            root = pkgs.symlinkJoin {
              name = "nixopts-with-data";
              paths = [
                # Base website
                (pkgs.callPackage ./package.nix { })

                # Additional data
                (pkgs.linkFarm "nixopts-data" {
                  "meta.json" = (pkgs.formats.json { }).generate "meta.json" {
                    inherit (cfg) defaultSet;

                    links = mapAttrsToList (name: href: { inherit name href; }) cfg.links;

                    modules = mapAttrs (
                      name:
                      { title, ... }:
                      {
                        inherit title;
                        path = "data/${sanitizeDerivationName "${name}.json"}";
                      }
                    ) cfg.modules;
                  };

                  data = pkgs.symlinkJoin {
                    name = "options-data";
                    paths = mapAttrsToList mkDocJSON cfg.modules;
                  };
                })
              ];
            };

            locations."/" = {
              tryFiles = "$uri /index.html";
            };
          };
        }
        // (optionalAttrs cfg.compression.brotli.enable { recommendedBrotliSettings = mkDefault true; })
        // (optionalAttrs cfg.compression.gzip.enable { recommendedGzipSettings = mkDefault true; });
    };

    assertions = [
      {
        assertion = cfg.modules != { };
        message = ''
          `services.nixopts-search` can't be enabled without any modules to document.
        '';
      }
    ];
  };
}
