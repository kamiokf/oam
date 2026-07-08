// Fixes RNFBApp "include of non-modular header inside framework module"
// Xcode errors that appear when react-native-firebase builds with
// useFrameworks: "static". Injects the standard build setting into the
// Podfile's post_install block during prebuild.
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SETTING =
    "    installer.pods_project.targets.each do |target|\n" +
    "      target.build_configurations.each do |config|\n" +
    "        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'\n" +
    "      end\n" +
    "    end\n";

module.exports = function withNonModularHeaders(config) {
    return withDangerousMod(config, [
        'ios',
        (cfg) => {
            const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
            let contents = fs.readFileSync(podfile, 'utf8');
            if (!contents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
                contents = contents.replace(
                    /post_install do \|installer\|/,
                    `post_install do |installer|\n${SETTING}`
                );
                fs.writeFileSync(podfile, contents);
            }
            return cfg;
        },
    ]);
};
