import { Service } from "encore.dev/service";
import log from "../../../../../../../../../opt/homebrew/Cellar/encore/1.41.8/libexec/runtimes/js/encore.dev/log/mod";
import { service } from "../../transformation/kindly_reminder/encore.service";

export default new Service("my_service_one");
log.info("Running service " + service.name);
