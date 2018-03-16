#!/usr/bin/env node
const questions = require("@unumux/ux-questions");
const fs = require("fs");
const { exec } = require("child_process");

(async function() {
    await createPackageJson();
    const shouldInstallEslint = await questions.yesNo(
        "Install eslint and unumux configuration?"
    );
    if (shouldInstallEslint) {
        await createEslint();
        await installEslint();
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

async function installEslint() {
    const packages = ["eslint", "@unumux/eslint-config-unumux", "prettier"];

    try {
        await runCmd(`yarn add --dev ${packages.join(" ")}`);
    } catch (e) {
        try {
            await runCmd(`npm install --save-dev ${packages.join(" ")}`);
        } catch (e) {}
    }
}

async function createEslint() {
    const existingEslintConfig = await checkForEslintConfig();
    let eslint = {};
    if(existingEslintConfig) {
        const answer = await questions.yesNo("An eslint config already exists. Would you like to configure it to extend from the unumux eslint configuration?");
        if(answer) {
            eslint = existingEslintConfig === "./package.json" ? JSON.parse(fs.readFileSync(existingEslintConfig)).eslintConfig : JSON.parse(fs.readFileSync(existingEslintConfig));
        }
    } 
    const type = await questions.list(
        "What type of project are you linting?",
        [
            { name: "Browser", value: false },
            { name: "Node", value: "node" },
            { name: "React", value: "react" }
        ]
    );
    eslint = Object.assign({}, eslint, {
        extends: type.length ? `@unumux/unumux/${type}` : "@unumux/unumux"
    });
    fs.writeFileSync("./.eslintrc", JSON.stringify(eslint));
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
        fs.stat(pathName, (err) => {
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
