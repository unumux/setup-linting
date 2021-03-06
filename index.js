#!/usr/bin/env node
const questions = require("@unumux/ux-questions");
const fs = require("fs");
const { exec } = require("child_process");

(async function() {
    const packages = [];

    await createPackageJson();
    const shouldInstallEslint = await questions.yesNo(
        "Install eslint and unumux configuration?"
    );

    if (shouldInstallEslint) {
        packages.push(
            "eslint",
            "@unumux/eslint-config-unumux",
            "prettier",
            "babel-eslint",
            "eslint-plugin-react"
        );
        await createEslint();
    }

    const shouldInstallStylelint = await questions.yesNo(
        "Install stylelint and unumux configuration?"
    );

    if (shouldInstallStylelint) {
        packages.push("stylelint", "@unumux/stylelint-config-unumux");
        await createStylelintConfig();
    }

    if (packages.length > 0) {
        await installPackages(packages);
    }
})();

async function createPackageJson() {
    const packageJsonExists = await checkForFile("./package.json");
    if (!packageJsonExists) {
        const answer = await questions.yesNo(
            "A package.json file does not exist. Would you like to create one?"
        );
        if (answer) {
            exec("npm init -y");
        }
    }
}

async function installPackages(packages) {
    try {
        await runCmd(`yarn add --dev ${packages.join(" ")}`);
    } catch (e) {
        try {
            await runCmd(`npm install --save-dev ${packages.join(" ")}`);
        } catch (e) {}
    }
}

async function createStylelintConfig() {
    const existingStylelintConfig = await checkForStylelintConfig();
    let stylelint = {};
    if (existingStylelintConfig) {
        const answer = await questions.yesNo(
            "An stylelint config already exists. Would you like to configure it to extend from the unumux stylelint configuration?"
        );
        if (answer) {
            stylelint =
                existingStylelintConfig === "./package.json"
                    ? JSON.parse(fs.readFileSync(existingStylelintConfig))
                        .stylelint
                    : JSON.parse(fs.readFileSync(existingStylelintConfig));
        }
    }
    stylelint = Object.assign({}, stylelint, {
        extends: "@unumux/stylelint-config-unumux"
    });
    fs.writeFileSync("./.stylelintrc", JSON.stringify(stylelint));
}

async function createEslint() {
    const existingEslintConfig = await checkForEslintConfig();
    let eslint = {};
    if (existingEslintConfig) {
        const answer = await questions.yesNo(
            "An eslint config already exists. Would you like to configure it to extend from the unumux eslint configuration?"
        );
        if (answer) {
            eslint =
                existingEslintConfig === "./package.json"
                    ? JSON.parse(fs.readFileSync(existingEslintConfig))
                        .eslintConfig
                    : JSON.parse(fs.readFileSync(existingEslintConfig));
        }
    }
    const type = await questions.list("What type of project are you linting?", [
        { name: "Browser", value: false },
        { name: "Node", value: "node" },
        { name: "React", value: "react" }
    ]);
    eslint = Object.assign({}, eslint, {
        extends: type.length ? `@unumux/unumux/${type}` : "@unumux/unumux"
    });
    fs.writeFileSync("./.eslintrc", JSON.stringify(eslint));
}

async function checkForStylelintConfig() {
    const stylelintRcExists = await checkForFile("./.stylelintrc");

    if (stylelintRcExists) {
        return "./.stylelintrc";
    }

    const packageJsonExists = await checkForFile("./package.json");

    if (packageJsonExists) {
        const packageJson = JSON.parse(fs.readFileSync("./package.json"));
        if (packageJson.hasOwnProperty("stylelint")) {
            return "./package.json";
        }
    }

    return false;
}

async function checkForEslintConfig() {
    const eslintRcExists = await checkForFile("./.eslintrc");

    if (eslintRcExists) {
        return "./.eslintrc";
    }

    const packageJsonExists = await checkForFile("./package.json");

    if (packageJsonExists) {
        const packageJson = JSON.parse(fs.readFileSync("./package.json"));
        if (packageJson.hasOwnProperty("eslintConfig")) {
            return "./package.json";
        }
    }

    return false;
}

function checkForFile(pathName) {
    return new Promise((resolve, reject) => {
        fs.stat(pathName, err => {
            if (!err) {
                return resolve(true);
            }

            if (err.code === "ENOENT") {
                return resolve(false);
            }

            return reject(err);
        });
    });
}

function runCmd(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }

            if (stderr) {
                return reject(stderr);
            }

            resolve(stdout);
        });
    });
}
