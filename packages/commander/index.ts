import { Command } from 'commander';
import { input, confirm } from '@inquirer/prompts';

const program = new Command();

program.name('scaffold-lqf').description('一个简单的脚手架').version('0.0.0');

program
  .command('create')
  .description('create a project')
  .action(() => {
    createProject();
  });

const createProject = async () => {
  const result = await input({ message: 'enter your name' });
  const isNeedEslint = await confirm({ message: 'install eslint?' });
  const isEnableTypeScript = await confirm({ message: 'support typescript?' });

  console.log(result, isNeedEslint, isEnableTypeScript);
};

program.parse();
