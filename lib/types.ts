import { User, Card, CardItem, Promise as PrismaPromise } from '@prisma/client';

export type UserWithCards = User & {
	cards: Card[];
};

export type CardWithDetails = Card & {
	user: User;
	items: (CardItem & {
		promises: PrismaPromise[];
	})[];
};

export type CardItemWithPromises = CardItem & {
	promises: PrismaPromise[];
};
