import { CommandLineAction, CommandLineStringParameter } from '@rushstack/ts-command-line'
import { outputEnvFile } from '../utils/File'
import { retrieveDotEnvCfg, retrieveReactEnvCfg } from '../utils/Utils'
import fs from 'fs'

export class SetAction extends CommandLineAction {
  private _dir!: CommandLineStringParameter
  get dir(): string {
    // --dir has a default value of 'build'
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._dir.value!
  }

  private _fileName!: CommandLineStringParameter
  get fileName(): string {
    // --dir has a default value of 'build'
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._fileName.value!
  }

  private _varName!: CommandLineStringParameter
  get varName(): string {
    // --var has a default value of 'env'
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._varName.value!
  }

  private _varPrefix!: CommandLineStringParameter
  get varPrefix(): string {
    // --var has a default value of 'varPrefix'
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._varPrefix.value!
  }

  protected onDefineParameters(): void {
    this._dir = this.defineStringParameter({
      description: 'Specify the location of your build folder',
      parameterLongName: '--dir',
      parameterShortName: '-d',
      argumentName: 'PATH_TO_BUILD_FOLDER',
      defaultValue: './build',
      required: false,
    })

    this._fileName = this.defineStringParameter({
      description: 'Specify the name for the output env file',
      parameterLongName: '--name',
      parameterShortName: '-n',
      argumentName: 'NAME_OF_ENV_FILE',
      defaultValue: 'env.js',
      required: false,
    })

    this._varName = this.defineStringParameter({
      description: 'Overwrite the variable name that will be stored in `window`',
      parameterLongName: '--var',
      parameterShortName: '-v',
      argumentName: 'VAR_NAME',
      defaultValue: 'env',
      required: false,
    })

    this._varPrefix = this.defineStringParameter({
      description: 'Specify the prefix of the environment variable applicable for load',
      parameterLongName: '--prefix',
      parameterShortName: '-p',
      argumentName: 'ENV_VAR_PREFIX',
      defaultValue: 'REACT_APP_',
      required: false,
    })
  }

  public constructor() {
    super({
      actionName: 'set',
      summary: 'Set environment variables into your React /build folder.',
      documentation: 'TODO',
    })
  }

  protected async onExecute(): Promise<void> {
    const envCfg = { ...retrieveDotEnvCfg(this.varPrefix), ...retrieveReactEnvCfg(this.varPrefix) }
    const hashedFileName = outputEnvFile(this.dir, this.fileName, envCfg, this.varName)

    const indexHtmlFile = `${this.dir}/index.html`
    fs.readFile(indexHtmlFile, 'utf-8', (err, contents) => {
      if (err) {
        console.log(err)
        throw new Error('cannot read index.html file: ' + err.message)
      }

      const replaced = contents.replace(this.fileName, hashedFileName)

      fs.writeFile(indexHtmlFile, replaced, 'utf-8', (err) => {
        if (err) {
          throw new Error('failed to rewrite index.html file: ' + err.message)
        }
      })
    })
  }
}
