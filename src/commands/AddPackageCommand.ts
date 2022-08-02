import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";
import { OptionalCommandParameter } from "./parameters/OptionalCommandParameter";

export class AddPackageCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('添加包', provider, 'dotnet');
    }

    protected shouldRun(item: TreeItem): boolean {
        this.parameters = [
            new StaticCommandParameter('add'),
            new StaticCommandParameter(item.project.fullPath),
            new StaticCommandParameter('package'),
            new InputTextCommandParameter('包名', ''),
            new OptionalCommandParameter('是否需要指定包版本？', new InputTextCommandParameter('包版本', '1.0.0.0', '-v'))
        ];

        return true;
    }
}