import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";

export class CreateNewSolutionCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('新建解决方案', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('new'),
            new StaticCommandParameter('sln'),
            new InputTextCommandParameter('解决方案名称', '', '-n')
        ];

        if (item && item.path) {
            this.parameters.push(new StaticCommandParameter(item.path, '-o'));
        }

        return true;
    }
}