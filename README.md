# electron-forge-maker-appimage

This is an [electron-forge](https://www.electronforge.io/) builder for [AppImage](https://appimage.org/).

It's far from complete, but it serves the basic needs of our application.

This is based on several existing projects.

[electron-forge-maker-appimage](https://github.com/electron-userland/electron-builder/tree/master/packages/electron-forge-maker-appimage)
This is the previous maker for electron forge. It does not work, I suspect it uses an older maker API and was never updated.

Working electron-forge makers can be found here. These were used as an example when creating this maker:
https://github.com/electron-userland/electron-forge/tree/master/packages/maker

Some parts of electron-builder are still used, specifically [app-builder-lib](https://github.com/electron-userland/electron-builder/tree/master/packages/app-builder-lib)

Overall, I suspect app-builder-lib isn't meant to work with electron-forge makers anymore. I am using the components that specifically wrap [app-builder](https://github.com/develar/app-builder), the tool that actually prepares the AppImage.

## Usage

```
yarn add --dev https://github.com/Marcus10110/electron-forge-maker-appimage.git
```

## example forgeconfig.js

```
makers: [
  {
    name: 'electron-forge-maker-appimage',
    platforms: ['linux'],
    config: { template: 'assets/AppRunTemplate.sh' },
  },
];

```

This was created specifically because we wanted to use AppImage's AppRun script to detect and load modern versions of libstdc++ and libgcc_s on older systems.