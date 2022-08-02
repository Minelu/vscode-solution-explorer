import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues} from "../tree";
import { CommandBase } from "./base/CommandBase";
import { ConfirmCommandParameter } from "./parameters/ConfirmCommandParameter";

export class DeleteCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('删除');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new ConfirmCommandParameter('确认删除文件 "'+ item.label + '" ?')
        ];

        return !!item.project;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        
        try {
            if (item.contextValue.startsWith(ContextValues.ProjectFile))
                await item.project.deleteFile(item.path);
            else if (item.contextValue.startsWith(ContextValues.ProjectFolder))
                await item.project.deleteFolder(item.path);
            else 
                return;

            this.provider.logger.log("已删除：" + item.path);
        } catch(ex) {
            this.provider.logger.error('未能删除文件：' + ex);
        }    
    }
}