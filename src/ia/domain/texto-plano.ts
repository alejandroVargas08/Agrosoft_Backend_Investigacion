export function aTextoPlano(texto: string): string {
  return texto
    .replace(/\r\n/g, '\n')
    .replace(/```[a-zA-Z]*\n?/g, '')
    .replace(/`([^`\n]*)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^[ \t]{0,3}#{1,6}[ \t]*/gm, '')
    .replace(/^[ \t]*>[ \t]?/gm, '')
    .replace(/^([ \t]*)[*+-][ \t]+/gm, '$1• ')
    .replace(/(^|[\s("'¿¡])\*(?=\S)([^*\n]+?)\*(?=$|[\s).,;:!?"'])/gm, '$1$2')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\p{Extended_Pictographic}\uFE0F?/gu, '')
    .replace(/\uFE0F|\u200D/g, '')
    .replace(/(\S)[ \t]{2,}/g, '$1 ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
