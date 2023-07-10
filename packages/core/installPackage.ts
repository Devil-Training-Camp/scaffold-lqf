import path from 'node:path';
import { exec, execSync } from 'node:child_process';
import { copyFile } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { select } from '@inquirer/prompts';
import ora from 'ora';
import chalk from 'chalk';

type ChoiceItem = {
  name: string;
  value: string;
};

const isCommandInstalled = (command: string) => {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

export const choiceBundler = async (): Promise<string> => {
  const choices: ChoiceItem[] = [];
  if (isCommandInstalled('npm')) {
    choices.push({
      name: 'npm',
      value: 'npm',
    });
  }
  if (isCommandInstalled('yarn')) {
    choices.push({
      name: 'yarn',
      value: 'yarn',
    });
  }
  if (isCommandInstalled('pnpm')) {
    choices.push({
      name: 'pnpm',
      value: 'pnpm',
    });
  }
  if (choices.length === 1) {
    return choices[0].name;
  }
  return await select({
    message: 'Select a package manager',
    choices,
  });
};

export const installPrettier = (bundler: string, destDir: string) => {
  const spinner = ora(`Loading ${chalk.red('prettier')}`).start();
  switch (bundler) {
    case 'npm':
      exec(`npm install prettier --save-dev --ignore-scripts`, () => {
        spinner.clear();
      });

      break;
    case 'yarn':
      exec(`yarn add prettier --save-dev --ignore-scripts`, () => {
        spinner.clear();
      });
      break;
    case 'pnpm':
      exec(`pnpm add prettier --save-dev --ignore-scripts`, () => {
        spinner.clear();
      });
      break;
    default:
      spinner.clear();
      break;
  }
  copyFile(
    path.resolve(
      fileURLToPath(import.meta.url),
      '../../boilerplate',
      '.prettierrc'
    ),
    path.resolve(destDir, '.prettierrc'),
    (error) => {
      if (error) {
        console.log(error);
      }
    }
  );
};
