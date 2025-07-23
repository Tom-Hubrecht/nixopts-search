# SPDX-FileCopyrightText: 2025 Tom Hubrecht <github@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  lib,
  buildNpmPackage,
}:

let
  inherit (lib.fileset)
    toSource
    unions
    ;

  meta = builtins.fromJSON (builtins.readFile (root + "/package.json"));

  root = ../.;
in

buildNpmPackage {
  pname = meta.name;
  inherit (meta) version;

  src = toSource {
    inherit root;

    fileset = unions (
      builtins.map (path: root + "/${path}") [
        "index.html"
        "package-lock.json"
        "package.json"

        "tsconfig.json"
        "vite.config.ts"

        "public/assets"

        "src"
      ]
    );
  };

  npmDepsHash = "sha256-BCODuCOPaBAR9E2QKT7sUx2ppR0gnF+MpQJbU5tixkA=";

  installPhase = ''
    mv dist $out
  '';
}
