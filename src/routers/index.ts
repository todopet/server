// @ts-nocheck
import { Router } from 'express';

import userRouter from './userRouter.ts';
import todoCategoryRouter from './todoCategoryRouter.ts';
import todoContentRouter from './todoContentRouter.ts';
import inventoryRouter from './inventoryRouter.ts';
import itemRouter from './itemRouter.ts';
import myPetRouter from './myPetRouter.ts';
import petRouter from './petRouter.ts';
import badgeRouter from './badgeRouter.ts';
// 버전1 라우터
const v1Router = Router();

// v1Router.use('/', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/todoCategories', todoCategoryRouter);
v1Router.use('/todoContents', todoContentRouter);
v1Router.use('/inventories', inventoryRouter);
v1Router.use('/items', itemRouter);
v1Router.use('/myPets', myPetRouter);
v1Router.use('/pets', petRouter);
v1Router.use('/badges', badgeRouter);

export const v1 = v1Router;
