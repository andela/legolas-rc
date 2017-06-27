import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "ActionableAnalytics",
  name: "reaction-actionable-analytics",
  icon: "fa fa-bar-chart",
  autoEnable: true,
  settings: {
    name: "ActionableAnalytics"
  },
  registry: [
    {
      route: "/dashboard/actionable_analytics",
      provides: "dashboard",
      name: "actionableAnalytics",
      label: "Actionable Analytics",
      description: "View Actionable Analytics For Your Shop",
      icon: "fa fa-bar-chart",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow",
      template: "actionableAnalytics"
    }
  ]
});
