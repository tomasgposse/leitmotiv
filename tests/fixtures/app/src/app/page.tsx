export const metadata = { openGraph: { images: ['https://picsum.photos/1200/630'] } };
export default function List({ items, people }) {
  if (!items.length) return <p className="empty">Todavía no hay nada en la lista</p>;
  return items.map((i) => <li key={i.id}><span className="avatar">{i.by.charAt(0)}</span>{i.name}</li>);
}
