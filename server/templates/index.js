import { defaultTemplate } from './newsletter-default.js';
import { compactTemplate } from './newsletter-compact.js';

/**
 * Templates disponibles para newsletters
 */
export const templates = {
  default: {
    name: 'Predeterminado',
    description: 'Template estándar con imágenes y diseño completo',
    render: defaultTemplate
  },
  compact: {
    name: 'Compacto',
    description: 'Template minimalista sin imágenes, ideal para lecturas rápidas',
    render: compactTemplate
  }
};

/**
 * Renderiza un newsletter usando el template especificado
 */
export function renderNewsletter(templateName, data) {
  const template = templates[templateName] || templates.default;
  return template.render(data);
}

/**
 * Lista todos los templates disponibles
 */
export function getAvailableTemplates() {
  return Object.keys(templates).map(key => ({
    id: key,
    name: templates[key].name,
    description: templates[key].description
  }));
}
