/* StatusBadge styles are defined in global.css (.badge, .badge-*) */

const STATUS_MAP = {
  DRAFT:            { cls: "badge-draft",    label: "Draft"            },
  SUBMITTED:        { cls: "badge-pending",  label: "Submitted"        },
  MANAGER_APPROVED: { cls: "badge-paid",     label: "Mgr Approved"     },
  FINANCE_APPROVED: { cls: "badge-approved", label: "Finance Approved" },
  PAID:             { cls: "badge-approved", label: "Paid"             },
  REJECTED:         { cls: "badge-rejected", label: "Rejected"         },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || STATUS_MAP.DRAFT;
  return (
    <span className={`badge ${config.cls}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;