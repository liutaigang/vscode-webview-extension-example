import { registerControllers } from 'cec-client-server/decorator'
import { AxiosControler } from '../axios.controller'
import { MessageControler } from '../message.controller'
import { VscThemeControler } from '../vsc-theme.controller'

registerControllers([VscThemeControler, AxiosControler, MessageControler])
