

export interface TransformationKindlyReminderUniversalRequest {
    name: (
        'create_asana_tickets'
        | 'close_asana_tickets'
        | 'prepare_issue_stage'
        | 'read_dashboard'
        | 'update_weekly_total_report'
        | 'get_issue_user_statistics'
        | 'get_printed_issues'
        | 'run_whole_script'
        | 'print_projects_stats'
        | 'print_users_stats'
        | 'prepare_manager_stage'
        | 'prepare_user_stage'
        | 'synchronise_user_list'
        | 'run_project_issue_hunting'
        | 'run_all_allowed_projects'
        | 'load_projects'
        | 'synchronise_projects_with_jira'
        | 'fix_automated_issues'
        );
    week: number
}

export interface TransformationKindlyReminderValidatorRequest {
    value: number
}

export interface TransformationKindlyReminderUniversalResponse {
    status: string;
}
