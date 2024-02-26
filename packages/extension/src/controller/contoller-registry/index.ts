import { registerControllers } from 'cec-client-server/decorator'
import { AxiosControler } from '../axios.controller'
import { MessageControler } from '../message.controller'
import { VscThemeControler } from '../vsc-theme.controller'
import { CommandControler } from '../command.controller'

registerControllers([VscThemeControler, AxiosControler, MessageControler, CommandControler])
