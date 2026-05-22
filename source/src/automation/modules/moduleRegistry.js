import { objectModules } from "./objects";

const modules = [
  ...objectModules,
];

export const moduleCategories = modules.reduce((categories, moduleDefinition) => {
  let category = categories.find(
    (item) => item.id === moduleDefinition.categoryId
  );

  if (!category) {
    category = {
      id: moduleDefinition.categoryId,
      name: moduleDefinition.categoryName,
      modules: [],
    };

    categories.push(category);
  }

  category.modules.push(moduleDefinition);

  return categories;
}, []);

export const moduleRegistry = modules.reduce((registry, moduleDefinition) => {
  registry[moduleDefinition.id] = moduleDefinition;
  return registry;
}, {});

export const moduleList = modules;