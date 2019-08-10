import MakerBase, { MakerOptions } from "@electron-forge/maker-base";
import { ForgePlatform } from "@electron-forge/shared-types";
import { MakerAppImageConfig } from "./Config";
export default class MakerAppImage extends MakerBase<MakerAppImageConfig> {
    name: string;
    defaultPlatforms: ForgePlatform[];
    isSupportedOnCurrentPlatform(): boolean;
    make({ dir, // '/home/build/Software/monorepo/packages/electron/out/name-linux-x64'
    appName, // 'name'
    makeDir, // '/home/build/Software/monorepo/packages/electron/out/make',
    targetArch, // 'x64'
    packageJSON, targetPlatform, //'linux',
    forgeConfig }: MakerOptions): Promise<string[]>;
}
