import { AsanaTicket, AsanaTicketCustomFields } from "../models/asana_resultsModels";

export function asanaCustomFieldsParser(asana_ticket: AsanaTicket): AsanaTicketCustomFields {
  const custom_fields_as_structure: AsanaTicketCustomFields = {};

  // Convert array of Ticket Fields into JSON structure for next step
  for (const custom_field of asana_ticket.custom_fields) {
    // Set Basic informations
    custom_fields_as_structure[custom_field.gid] = {
      gid: custom_field.gid,
      type: custom_field.resource_subtype,
      display_value: custom_field.display_value,
      options: {},
      options_ids: [],
      user_ids: [],
      people_values: [],
    };
    const field = custom_fields_as_structure[custom_field.gid];

    // Set If Type is Enum
    if (custom_field.resource_subtype == "enum") {
      if (custom_field.enum_value) {
        field.enum_value_id = custom_field.enum_value.gid;
        field.enum_value = {
          id: custom_field.enum_value.gid,
          name: custom_field.enum_value.name,
        };
      }

      if (custom_field.enum_options) {
        for (const enum_options of custom_field.enum_options) {
          if (enum_options.gid == field.enum_value_id) {
            field.name = enum_options.name;
          }
        }

        for (const enum_options of custom_field.enum_options) {
          field.options_ids.push(enum_options.gid);
          field.options[enum_options.name] = enum_options;
        }
      }
    }

    if (custom_field.resource_subtype == "text") {
      field.text_value = custom_field.text_value;
    }

    if (custom_field.resource_subtype == "number") {
      field.number_value = custom_field.number_value;
    }

    if (custom_field.resource_subtype == "people") {
      if (custom_field.people_value && custom_field.people_value.length > 0) {
        custom_field.people_value.forEach((p) => {
          field.user_ids.push(p.gid);
          field.people_values.push({
            gid: p.gid,
            name: p.name,
          });
        });
      }
    }

    if (custom_field.resource_subtype == "date") {
      if (custom_field.date_value) {
        field.date_time = custom_field.date_value.date_time;
      }
    }
  }

  return custom_fields_as_structure;
}
