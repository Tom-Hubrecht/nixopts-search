# NixOpts Search

This is a user-friendly tool to browse the documentation of NixOS modules offline.

It allows documenting as many option sets as you want in one place!

E.g.

- Home Manager
- Lanzaboote
- NixOS
- Whatever custom modules you had to write for your infra

## Configuration

An example configuration that will host NixOS options documentation is:

```nix
{ config, lib, pkgs, ... }:

{
  imports = [ (sources.nixopts-search + "/nix/module.nix") ];

  services.nginx.virtualHosts.${config.services.nixopts-search.host} = {
    enableACME = true;
    forceSSL = true;
  };

  services.nixopts-search = {
    enable = true;

    host = "search.example.com";

    modules.nixos = {
      title = "NixOS 25.05";

      paths = import (pkgs.path + "/nixos/modules/module-list.nix");

      origins = [
        {
          base = pkgs.path + "/nixos/modules";
          url = "https://github.com/NixOS/nixpkgs/tree/nixos-25.05/nixos/modules";
        }
      ];

      specialArgs = {
        inherit pkgs lib;
        modulesPath = pkgs.path + "/nixos/modules/";
      };
    };
  };
}
```

The served files can also be compressed to reduce bandwidth usage (going from 13MB to < 1MB for NixOS).

```nix
{
  nixopts-search.compression = {
    brotli.enable = true;
    gzip.enable = true;
  };
}
```

There is a [demo website](https://search.hubrecht.ovh) and some pictures in [./images]
