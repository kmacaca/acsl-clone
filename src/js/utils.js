export const $ = (selector, scope = document) => scope.querySelector(selector)
export const $$ = (selector, scope = document) => scope.querySelectorAll(selector)

export const getTemplateClone = (selector) => {
  const template = $(selector)
  return template.content.cloneNode(true).firstElementChild
}

export const lerp = (a, b, t) => a + (b - a) * t
