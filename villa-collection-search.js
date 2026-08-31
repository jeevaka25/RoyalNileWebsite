document.addEventListener('DOMContentLoaded', () => {
  const cards = [...document.querySelectorAll('#collection .inventory-card')];
  RoyalAvailability.mount({inventory:VILLAS, resultsId:'collection',
    render(available) { const ids = new Set(available.map(v => v.id)); cards.forEach(card => { card.hidden=!ids.has(card.id); }); },
    reset() { cards.forEach(card => { card.hidden=false; }); }
  });
});
