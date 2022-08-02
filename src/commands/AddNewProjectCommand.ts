import * as path from "path";
import { execSync } from 'child_process';
import { CliCommandBase } from "./base/CliCommandBase";
import { SolutionExplorerProvider } from "../SolutionExplorerProvider";
import { TreeItem } from "../tree/TreeItem";
import { StaticCommandParameter } from "./parameters/StaticCommandParameter";
import { InputTextCommandParameter } from "./parameters/InputTextCommandParameter";
import { InputOptionsCommandParameter } from "./parameters/InputOptionsCommandParameter";

const ProjectTypes = [
    // { name: 'Console application', value: 'console', languages: ['C#', 'F#', 'VB'] },
    // { name: 'Class library', value: 'classlib', languages: ['C#', 'F#', 'VB'] },
    // { name: 'WPF Application', value: 'wpf', languages: ['C#'] },
    // { name: 'WPF Class library', value: 'wpflib', languages: ['C#'] },
    // { name: 'WPF Custom Control Library', value: 'wpfcustomcontrollib', languages: ['C#'] },
    // { name: 'WPF User Control Library', value: 'wpfusercontrollib', languages: ['C#'] },
    // { name: 'Windows Forms (WinForms) Application', value: 'winforms', languages: ['C#'] },
    // { name: 'Windows Forms (WinForms) Class library', value: 'winformslib', languages: ['C#'] },
    // { name: 'Worker Service', value: 'worker', languages: ['C#'] },
    // { name: 'Unit test project', value: 'mstest', languages: ['C#', 'F#', 'VB'] },
    // { name: 'xUnit test project', value: 'xunit', languages: ['C#', 'F#', 'VB'] },
    // { name: 'NUnit 3 Test Project', value: 'nunit', languages: ['C#', 'F#', 'VB'] },
    // { name: 'ASP.NET Core empty', value: 'web', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core Web App (Model-View-Controller)', value: 'mvc', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core Web App', value: 'razor', languages: ['C#'] },
    // { name: 'ASP.NET Core with Angular', value: 'angular', languages: ['C#'] },
    // { name: 'ASP.NET Core with React.js', value: 'react', languages: ['C#'] },
    // { name: 'ASP.NET Core with React.js and Redux', value: 'reactredux', languages: ['C#'] },
    // { name: 'ASP.NET Core Web API', value: 'webapi', languages: ['C#', 'F#'] },
    // { name: 'ASP.NET Core gRPC Service', value: 'grpc', languages: ['C#'] },
    // { name: 'Blazor Server App', value: 'blazorserver', languages: ['C#'] },
    // { name: 'Blazor WebAssembly App', value: 'blazorwasm', languages: ['C#'] },
    // { name: 'Razor Class Library', value: 'razorclasslib', languages: ['C#'] },
];

export class AddNewProjectCommand extends CliCommandBase {
    constructor(provider: SolutionExplorerProvider) {
        super('添加新项目', provider, 'dotnet');
    }

    protected async runCommand(item: TreeItem, args: string[]): Promise<void> {
        await super.runCommand(item, args);
        await this.addProjectToSolution(item);
    }

    protected shouldRun(item: TreeItem): boolean {
        this.loadProjectTemplates();
        this.parameters = [
            new StaticCommandParameter('new'),
            new InputOptionsCommandParameter('选择项目类型', this.getProjectTypes()),
            new InputOptionsCommandParameter('选择所使用语言', () => this.getLanguages(), '-lang'),
            new InputTextCommandParameter('项目名称', '', '-n'),
            new InputTextCommandParameter('文件夹名称', '', '-o', () => this.getDefaultFolder()),
        ];

        return true;
    }

    private loadProjectTemplates(): void {
        if (ProjectTypes.length > 0) return;

        let buffer = execSync('dotnet new --list');
        if (!buffer) {
            return;
        }

        let lines = buffer.toString().split('\n');
        if (lines.length > 4) {
            lines.splice(0, 4); /* ignore header */
            lines.forEach(line => {
                let parts = line.split('  ').filter(element => element);
                if (parts.length > 2) {
                    let littleTypes = parts[1].split(',').map(element => element.trim())
                    if (littleTypes.length > 1) {
                        littleTypes.forEach(littleType => {
                            ProjectTypes.push({
                                name: `${parts[0].trim()}(${littleType})`,
                                value: littleType,
                                languages: parts[2].split(',').map(element => element.trim().replace('[', '').replace(']', ''))
                            });
                        })
                    } else {
                        ProjectTypes.push({
                            name: parts[0].trim(),
                            value: littleTypes,
                            languages: parts[2].split(',').map(element => element.trim().replace('[', '').replace(']', ''))
                        });
                    }
                }
            });
        }
    }

    private getProjectTypes(): { [id: string]: string } {
        let result: { [id: string]: string } = {};
        ProjectTypes.forEach(pt => {
            result[pt.name] = pt.value;
        });
        return result;
    }

    private getLanguages(): Promise<string[]> {
        let result: string[] = ['C#'];
        let selectedProject = this.parameters[1].getArguments()[0];
        let index = ProjectTypes.findIndex(pt => pt.value == selectedProject);
        if (index >= 0)
            result = ProjectTypes[index].languages;

        return Promise.resolve(result);
    }

    private addProjectToSolution(item: TreeItem): Promise<void> {
        let workingpath = path.dirname(item.path);
        let projectPath = path.join(workingpath, this.parameters[4].getArguments()[1], this.parameters[3].getArguments()[1]);
        if (this.args[this.args.length - 5] == 'C#') projectPath += '.csproj';
        if (this.args[this.args.length - 5] == 'F#') projectPath += '.fsproj';
        if (this.args[this.args.length - 5] == 'VB') projectPath += '.vbproj';

        return this.runCliCommand('dotnet', ['sln', item.path, 'add', projectPath], workingpath);
    }

    private getDefaultFolder(): Promise<string> {
        return Promise.resolve(this.parameters[3].getArguments()[1]);
    }
}
