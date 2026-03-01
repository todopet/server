import { Router } from 'express';

import userRouter from './userRouter.js';
import todoCategoryRouter from './todoCategoryRouter.js';
import todoContentRouter from './todoContentRouter.js';
import inventoryRouter from './inventoryRouter.js';
import itemRouter from './itemRouter.js';
import myPetRouter from './myPetRouter.js';
import petRouter from './petRouter.js';
import badgeRouter from './badgeRouter.js';
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
