import { DeckScreen } from '@/components/deck/deck-screen';
import { DECKS } from '@/decks';

// Статическая выгрузка: страница на каждую презентацию собирается заранее, других адресов нет.
export const dynamicParams = false;

export function generateStaticParams() {
  return DECKS.map((d) => ({ id: d.id }));
}

export default function DeckPage({ params }: { params: { id: string } }) {
  return <DeckScreen id={params.id} />;
}
