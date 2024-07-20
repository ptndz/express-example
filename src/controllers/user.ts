import { Route, Tags, Post, Body ,Get} from "tsoa";
import { createUser,getUsers, IUserPayload } from "../services/user";
import { User } from "../entity/User";

@Route("users")
@Tags("User")
export default class UserController {
	@Post("/")
	public async createUser(@Body() body: IUserPayload): Promise<User> {
		return createUser(body);
	}
  @Get("/")
  public async getUsers(): Promise<Array<User>> {
    return getUsers()
  }

}
