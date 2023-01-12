import { Rule, Tree, SchematicContext, SchematicsException, UpdateRecorder } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { applyToUpdateRecorder } from '@schematics/angular/utility/change';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import * as ts from 'typescript';

type TreeBuffer = Buffer | null;

export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Adding library Module to the app...');
    const modulePath: string = 'src/app/app.module.ts';

    if (!tree.exists(modulePath)) {
      throw new SchematicsException(`The file ${modulePath} doesn't exists!`);
    }

    const recorder: UpdateRecorder = tree.beginUpdate(modulePath);
    const text: TreeBuffer = tree.read(modulePath);

    if(text === null) {
      throw new SchematicsException(`The file ${modulePath} doesn't exists!`)
    }

    const source: ts.SourceFile = ts.createSourceFile(
      modulePath,
      text.toString(),
      ts.ScriptTarget.Latest,
      true
    );

    applyToUpdateRecorder(recorder,
        addImportToModule(source, modulePath, 'SuperUiLibModule', 'super-ui-lib')
    );

    tree.commitUpdate(recorder);

    context.logger.info('Installing dependencies...');
    context.addTask(new NodePackageInstallTask())
    return tree;
  }
}
