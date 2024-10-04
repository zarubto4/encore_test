import {UserStage} from "./prepareUserStatsStage";
import moment from "moment/moment.js";
import {User} from "jira.js/src/version3/models/user";
import {ActiveUserWorkSheet} from "./_models";
import {KindlyReminderConfigApp} from "../../encore.service";
import {ActiveWorkSheetIssue} from "../getIssues/_models";



export class SynchronizeUserWorkSheet {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();
    protected static weekSheetCopy: ActiveWorkSheetIssue | null = null;

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public async  synchronize(): Promise<ActiveUserWorkSheet> {

        console.log("SynchronizeUserWorkSheet:getActiveUserWorkSheet: init =============================================");

        const result = await new UserStage().getActiveUserWorkSheet( moment().isoWeek());

        console.log("SynchronizeUserWorkSheet:getActiveUserWorkSheet: total users in worksheet:", Object.keys(result.userWorkSheet.users).length);

        const users =  await this.configApp.jiraServices.user.getUsers({maxResults: 30000});

        console.log("SynchronizeUserWorkSheet:getActiveUserWorkSheet: total users in JIRA:", users.length);

        for (const user of users) {
            if (!user.emailAddress || !user.emailAddress.includes("@groupon.com")) {
                continue;
            }

            if (result.userWorkSheet.users[user.emailAddress]) {
                console.log("   - user is in worksheet properly user:", user.displayName);
            } else if(user.displayName && result.userWorkSheet.users[user.displayName]) {
                console.log("User:", user.displayName, user.emailAddress, user.active);
                console.log("   - user is in worksheet properly - required to update");
                result.userWorkSheet.users[user.emailAddress] = result.userWorkSheet.users[user.displayName]
                delete result.userWorkSheet.users[user.displayName];
                result.sheet.getCellByA1(result.userWorkSheet.cells.userCells.userEmailColum + result.userWorkSheet.users[user.emailAddress].row).value = user.emailAddress;
            }
        }

        // Srt Emails for missing Mangers
        for (const userKey of Object.keys(result.userWorkSheet.users)) {
            if (result.userWorkSheet.users[userKey].manager &&
                (
                    !result.userWorkSheet.users[userKey].manager.managerEmail
                    && result.userWorkSheet.users[userKey].manager.managerName
                )) {

                console.log("   - we are lookign for manager:", result.userWorkSheet.users[userKey].manager.managerName);
                const found: User[] = users.filter((us) => result.userWorkSheet.users[userKey].manager != null && us.displayName == result.userWorkSheet.users[userKey].manager.managerName);

                if (found.length > 0) {
                    result.sheet.getCellByA1(result.userWorkSheet.cells.managerCells.managerEmailColum + result.userWorkSheet.users[userKey].row).value = found[0].emailAddress;
                } else {
                    console.log("   -  manager not found in JIRA list: Manager Name:", result.userWorkSheet.users[userKey].manager.managerName);

                }
            } else{
                console.log("   - user not contains any fragment of manager");
            }
        }

        await result.sheet.saveUpdatedCells();

    }

}
