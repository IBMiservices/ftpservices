import { format } from "winston";

/*
 * function application (info)
 * Returns a new instance of the application Format which adds the
 * application name to the info.
 *
 * { name: application name }  // f. e. "blockdata-notification"
 */
const application = format((info, opts = {}) => {
    if (opts.name) info.app = opts.name;
    return info;
});

export default application;
