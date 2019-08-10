import MakerBase, { MakerOptions } from "@electron-forge/maker-base";
import {
  ForgePlatform,
  IForgeResolvableMaker,
  IForgeMaker
} from "@electron-forge/shared-types";
import path from "path";
import * as appBuilder from "app-builder-lib/out/util/appBuilder";
import { MakerAppImageConfig } from "./Config";
import { mkdirSync, existsSync, rmdirSync } from "fs";

const makerPackageName = "electron-forge-maker-appimage";

interface AppImageForgeConfig {
  template?: string;
}

const isIForgeResolvableMaker = (
  maker: IForgeResolvableMaker | IForgeMaker
): maker is IForgeResolvableMaker => {
  return maker.hasOwnProperty("name");
};

export default class MakerAppImage extends MakerBase<MakerAppImageConfig> {
  name = "appImage";

  defaultPlatforms: ForgePlatform[] = ["linux"];

  isSupportedOnCurrentPlatform() {
    return process.platform === "linux";
  }

  async make({
    dir, // '/home/build/Software/monorepo/packages/electron/out/name-linux-x64'
    appName, // 'name'
    makeDir, // '/home/build/Software/monorepo/packages/electron/out/make',
    targetArch, // 'x64'
    packageJSON,
    targetPlatform, //'linux',
    forgeConfig
  }: MakerOptions) {
    // toLowerCase added because for reasons I don't understand, we always get a lowercase binary despite the config.
    const executableName = (
      forgeConfig.packagerConfig.executableName || appName
    ).toLowerCase();

    // Check for any optional configuration data passed in from forge config, specific to this maker.
    let config: AppImageForgeConfig | undefined;

    const maker = forgeConfig.makers.find(
      maker => isIForgeResolvableMaker(maker) && maker.name === makerPackageName
    );

    if (maker !== undefined && isIForgeResolvableMaker(maker)) {
      config = maker.config;
    }

    const appFileName = `${appName}-${packageJSON.version}.AppImage`;
    const appPath = path.join(makeDir, appFileName);

    // construct the desktop file.
    const desktopMeta: { [parameter: string]: string } = {
      Name: appName,
      Exec: executableName,
      Terminal: "false",
      Type: "Application",
      Icon: executableName,
      StartupWMClass: packageJSON.productName as string,
      "X-AppImage-Version": packageJSON.version,
      Comment: packageJSON.description,
      Categories: "Utility"
    };

    let desktopEntry = `[Desktop Entry]`;
    for (const name of Object.keys(desktopMeta)) {
      desktopEntry += `\n${name}=${desktopMeta[name]}`;
    }
    desktopEntry += "\n";

    // icons don't seem to work in AppImages anyway. this is just the default taken from the old AppImage maker.
    const iconPath = path.join(
      dir,
      "../..",
      "node_modules/app-builder-lib/templates/icons/electron-linux"
    );
    const icons = [
      { file: `${iconPath}/16x16.png`, size: 16 },
      { file: `${iconPath}/32x32.png`, size: 32 },
      { file: `${iconPath}/48x48.png`, size: 48 },
      { file: `${iconPath}/64x64.png`, size: 64 },
      { file: `${iconPath}/128x128.png`, size: 128 },
      { file: `${iconPath}/256x256.png`, size: 256 }
    ];

    const stageDir = path.join(makeDir, "__appImage-x64");
    if (existsSync(stageDir)) {
      rmdirSync(stageDir);
    }
    mkdirSync(stageDir);

    const args = [
      "appimage",
      "--stage", // '/home/build/Software/monorepo/packages/electron/out/make/__appImage-x64',
      stageDir,
      "--arch", // 'x64'
      "x64",
      "--output", // '/home/build/Software/monorepo/packages/electron/out/make/name-2.0.6.AppImage',
      appPath,
      "--app", // '/home/build/Software/monorepo/packages/electron/out/name-linux-x64',
      dir,
      "--configuration",
      JSON.stringify({
        productName: appName,
        productFilename: appName,
        desktopEntry: desktopEntry,
        executableName: executableName,
        icons: icons,
        fileAssociations: []
      })
    ];

    // the --template option allows us to replace AppRun bash script with a custom version, e.g. a libstdc++ bootstrapper.
    if (config !== undefined && config.template) {
      args.push("--template");
      args.push(config.template);
    }

    const result = await appBuilder.executeAppBuilderAsJson(args);

    return [appPath];
  }
}
