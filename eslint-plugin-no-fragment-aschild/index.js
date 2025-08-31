module.exports.rules = {
  'no-fragment-aschild': {
    create(ctx) {
      const targets = new Set([
        'DialogTrigger','DropdownMenuTrigger','PopoverTrigger','TooltipTrigger',
        'HoverCardTrigger','CollapsibleTrigger','AccordionTrigger','Slot','Button'
      ]);
      return {
        JSXElement(node) {
          const name = node.openingElement.name;
          const id = name.type === 'JSXIdentifier' ? name.name : null;
          if (!id || !targets.has(id)) return;
          const asChild = node.openingElement.attributes.some(a => a.type==='JSXAttribute' && a.name.name==='asChild');
          if (!asChild && id!=='Slot' && !(id==='Button')) return;
          const children = node.children.filter(c => c.type!=='JSXText' || c.value.trim()!=='');
          if (children.length > 1) ctx.report({ node, message: 'Com asChild, use apenas um filho.' });
        }
      };
    }
  }
};