import { OpenDialogOptions } from "vscode";
import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { OpenFileCommandParameter } from "./parameters/OpenFileCommandParameter";

export class AddExistingProjectCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('添加已存在的项目', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        let options: OpenDialogOptions = {
		    openLabel: 'Add',
    		canSelectFolders: false,
    		canSelectMany: false,
		    filters: { '项目文件': [ 'csproj', 'vbproj', 'fsproj' ] }
        };
        this.parameters = [
            new StaticCommandParameter('sln'),
            new StaticCommandParameter(item.path),
            new StaticCommandParameter('add'),
            new OpenFileCommandParameter(options)
        ];

        return true;
    }
}