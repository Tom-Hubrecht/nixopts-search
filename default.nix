# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  sources ? import ./lon.nix,
  pkgs ? import sources.nixpkgs { },
}:

let
  nix-reuse = import sources.nix-reuse { inherit pkgs; };

  reuse-toml = nix-reuse.install {
    defaultLicense = "EUPL-1.2";
    defaultCopyright = "Tom Hubrecht <github@mail.hubrecht.ovh>";

    downloadLicenses = true;

    installPath = builtins.toString ./.;

    generatedPaths = [
      ".envrc"
      ".gitignore"

      "lon.lock"
      "lon.nix"

      "package-lock.json"
      "package.json"
      "tsconfig.json"
      "tsconfig.node.json"
      "vite.config.ts"
    ];

    annotations = [
      # Bulma: https://github.com/jgthms/bulma
      {
        path = "src/sass/bulma/**";
        license = "MIT";
        copyright = "Jeremy Thomas";
      }

      # Atkinson Hyperlegible: https://www.brailleinstitute.org/freefont/
      {
        path = [
          "src/assets/fonts/AtkinsonHyperlegibleMono-Regular.woff2"
          "src/assets/fonts/AtkinsonHyperlegibleNext-Regular.woff2"
        ];
        license = "OFL-1.1";
        copyright = "2020 Braille Institute of America, Inc.";
      }
    ];
  };
in

{
  package = pkgs.callPackage ./nix/package.nix { };

  devShell = pkgs.mkShellNoCC {
    name = "msearch.dev";

    packages = [
      pkgs.nodejs
    ];

    shellHook = builtins.concatStringsSep "\n" [
      reuse-toml.shellHook
    ];
  };
}
