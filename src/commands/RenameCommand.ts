import * as vscode from "vscode";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem, ContextValues } from "../tree";
import { CommandBase } from "./base/CommandBase";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class RenameCommand extends CommandBase {

    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Rename');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new InputTextCommandParameter('新名称', item.label, null, item.label)
        ];

        return !!item.project;
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        if (!args || args.length <= 0) return;

        try {
            if (item.contextValue.startsWith(ContextValues.ProjectFile))
                await item.project.renameFile(item.path, args[0]);
            else if (item.contextValue.startsWith(ContextValues.ProjectFolder))
                await item.project.renameFolder(item.path, args[0]);
            else 
                return;

            this.provider.logger.log("已重命名: " + item.path + " -> " + args[0]);
        } catch(ex) {
            this.provider.logger.error('未能重命名文件：' + ex);
        }    
    }
}