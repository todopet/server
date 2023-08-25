import { MyPetModel, PetModel } from '../db/models/index.js';
import { PetService, InventoryService } from './index.js';
import mongoose from 'mongoose';

class MyPetService {
    constructor() {
        this.myPetModel = new MyPetModel();
        this.petService = new PetService();
        this.petModel = new PetModel();
        this.inventoryService = new InventoryService();
    }
    async getMyPet(userId) {
        return await this.myPetModel.findByUserId(userId);
    }
    async getPetStorageIdByUserId(userId) {
        const petStorage = await this.myPetModel.findByUserId(userId);

        if (!petStorage) {
            throw new Error(`petStorage no found for userId: ${userId}`);
        }
        return petStorage._id.toString();
    }

    // myPet 단일 조회
    async getMyPetByPetId(petStorageId, petId) {
        const petStorage = await this.getPetStorageByPetStorageId(petStorageId);
        const pet = petStorage.pets.find((p) => p._id.toString() === petId);

        if (!pet) {
            throw new Error('Pet not found in petStorage');
        }

        return pet;
    }

    async getPetStorageByPetStorageId(petStorageId) {
        const petStorage = await this.myPetModel.findByPetStorageId(
            petStorageId
        );

        if (!petStorage) {
            throw new Error('PetStorage not found');
        }

        return petStorage;
    }

    async getPetByLevel(level) {
        return await this.petModel.findByLevel(level);
    }

    async addPetStorage(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid userId');
        }

        // 펫을 가져오기 위한 PetService 인스턴스 생성
        const petService = new PetService();

        // 0 레벨 펫을 가져옴
        const lowestLevelPet = await petService.getLowestLevel();

        // pets 배열에 0 레벨 펫과 추가 정보를 추가하여 petStorage 생성
        const petStorage = await this.myPetModel.create({
            userId: userId.toString(),
            pets: [
                {
                    pet: lowestLevelPet
                }
            ]
        });
        return petStorage;
    }

    async addMyPet(userId, petId) {
        const pet = await this.petService.getPet(petId);

        // 펫 정보를 생성
        const petInfo = {
            petName: pet.petName,
            level: pet.level,
            experience: pet.experience,
            hunger: pet.hunger,
            affection: pet.affection,
            cleanliness: pet.cleanliness,
            condition: pet.condition
        };
        // 기존 petStorage 가져오기
        const petStorageId = await this.getPetStorageIdByUserId(userId);
        const petStorage = await this.myPetModel.findByPetStorageId(
            petStorageId
        );

        // 기존 petStorage의 pets 배열에 펫을 추가
        petStorage.pets.push({
            pet: pet
        });

        // 수정된 petStorage 저장
        const updatedPetStorage = await this.myPetModel.update(
            petStorageId,
            petStorage
        );

        return updatedPetStorage; // 업데이트된 petStorage를 반환
    }

    //펫 정보 각각 업데이트
    async updatePetInMyPet(petStorageId, petId, updatedFields) {
        const petStorage = await this.getPetStorageByPetStorageId(petStorageId);

        const petToUpdate = petStorage.pets.find(
            (pet) => pet._id.toString() === petId
        );

        if (!petToUpdate) {
            throw new Error('Pet not found in petStorage');
        }

        // 기존 정보를 업데이트할 필드로 덮어씌웁니다.
        Object.assign(petToUpdate.pet, updatedFields);

        // 전체 petStorage 객체를 업데이트합니다 (업데이트된 펫을 포함)
        const updatedPetStorage = await this.myPetModel.update(
            petStorageId,
            petStorage
        );

        return petToUpdate; // 업데이트된 펫 정보를 반환
    }

    async updatePetWithItemEffect(
        userId,
        statuses,
        effect,
        experience,
        quantity
    ) {
        // 64e6d41a3a66926a9ec9fb47
        // [ 'hunger' ]
        // 30
        // 80
        const petStorageId = await this.getPetStorageIdByUserId(userId);
        //console.log(petStorageId);
        //64e6d41a3a66926a9ec9fb4e
        const petStorage = await this.getPetStorageByPetStorageId(petStorageId);
        const userPetName = petStorage.pets[0].pet.petName;
        //console.log(petStorage);
        // {
        //     _id: new ObjectId("64e6d41a3a66926a9ec9fb4e"),
        //     userId: new ObjectId("64e6d41a3a66926a9ec9fb47"),
        //     pets: [ { pet: [Object], _id: new ObjectId("64e6d41a3a66926a9ec9fb4f") } ],
        //     createdAt: 2023-08-24T03:52:58.270Z,
        //     updatedAt: 2023-08-24T03:54:43.735Z
        //   }

        const updatedPet = { ...petStorage };
        updatedPet.pets[0].pet.experience;
        updatedPet.pets[0].pet.level;
        updatedPet.pets[0].pet.hunger;
        updatedPet.pets[0].pet.affection;
        updatedPet.pets[0].pet.cleanliness;
        updatedPet.pets[0].pet.condition;
        //console.log(updatedPet.pets[0].pet.level); // 0
        //console.log(updatedPet.pets[0].pet.experience) // 100

        // 경험치에 아이템 경험치를 더해줌
        updatedPet.pets[0].pet.experience =
            updatedPet.pets[0].pet.experience + experience * quantity;
        // console.log(updateMyPetExperience);
        //180
        // console.log(myPetLevel);
        //0
        // 경험치가 최대 경험치를 넘어가면 레벨 업 처리
        const maxExperience = await this.getMaxExperienceByPetLevel(
            updatedPet.pets[0].pet.level
        ); //0레벨 펫의 maxExperience는 100 임

        if (
            updatedPet.pets[0].pet.level < 5 &&
            updatedPet.pets[0].pet.experience >= maxExperience
        ) {
            updatedPet.pets[0].pet.level += 1;

            // 레벨에 따른 상태 최대치 업데이트
            const maxStatuses = await this.getMaxStatusesByPetLevel(
                updatedPet.pets[0].pet.level,
                userPetName
            );
            updatedPet.pets[0].pet._id = maxStatuses._id;
            // updatedPet.pets[0].pet.petName = maxStatuses.petName;
            updatedPet.pets[0].pet.experience = 0;
            updatedPet.pets[0].pet.hunger = maxStatuses.hunger;
            updatedPet.pets[0].pet.affection = maxStatuses.affection;
            updatedPet.pets[0].pet.cleanliness = maxStatuses.cleanliness;
            updatedPet.pets[0].pet.condition = maxStatuses.condition;
        } else if (updatedPet.pets[0].pet.level < 5) {
            // 여기서부터 아이템 써서 상태 업데이트
            // statuses는 아이템의 효과 [배고픔, 청결, 애정, 컨디션] 중 선택
            // const maxStatuses =
            //     await this.inventoryService.getMaxStatusesByPetLevel(
            //         updatedPet.pets[0].pet.level
            //     );

            const maxStatuses = await this.getMaxStatusesByPetLevel(
                updatedPet.pets[0].pet.level,
                userPetName
            );

            const promises = statuses.map(async (status) => {
                if (
                    updatedPet.pets[0].pet[status] !== undefined ||
                    updatedPet.pets[0].pet[status] === 0
                ) {
                    if (
                        updatedPet.pets[0].pet[status] + effect * quantity >
                        maxStatuses[status]
                    ) {
                        updatedPet.pets[0].pet[status] = maxStatuses[status];
                    } else {
                        updatedPet.pets[0].pet[status] += effect * quantity;
                    }
                }
            });

            await Promise.all(promises);
        } else {
            // 여기서부터 아이템 써서 상태 업데이트
            // statuses는 아이템의 효과 [배고픔, 청결, 애정, 컨디션] 중 선택

            const maxStatuses = await this.getMaxStatusesByPetLevel(
                updatedPet.pets[0].pet.level,
                userPetName
            );

            const promises = statuses.map(async (status) => {
                if (
                    updatedPet.pets[0].pet[status] !== undefined ||
                    updatedPet.pets[0].pet[status] === 0
                ) {
                    if (
                        updatedPet.pets[0].pet[status] + effect * quantity >
                        maxStatuses[status]
                    ) {
                        updatedPet.pets[0].pet[status] = maxStatuses[status];
                    } else {
                        updatedPet.pets[0].pet[status] += effect * quantity;
                    }
                }
            });

            await Promise.all(promises);
        }
        // 펫 정보 업데이트
        return await this.statusUpdatePetInMyPet(
            petStorageId,
            updatedPet.pets[0]._id,
            updatedPet
        );
    }
    //아이템 사용시 펫 상태 업데이트 저장
    async statusUpdatePetInMyPet(petStorageId, updatePetId, updatedPet) {
        const petStorage = await this.getPetStorageByPetStorageId(petStorageId);
        console.log(petStorage.pets[0]);

        const petToUpdate = petStorage.pets.find(
            (pet) => pet._id.toString() === updatePetId.toString()
        );

        if (!petToUpdate) {
            throw new Error('Pet not found in petStorage');
        }

        Object.assign(petToUpdate, updatedPet.pets[0]);

        // 전체 petStorage 객체를 업데이트합니다 (업데이트된 펫을 포함)
        const updatedPetStorage = await this.myPetModel.update(
            petStorageId,
            petStorage
        );

        return petToUpdate; // 업데이트된 펫 정보를 반환
    }

    async getMaxStatusesByPetLevel(level, userPetName) {
        const petByLevel = await this.getPetByLevel(level);

        //console.log(petByLevel);
        //console.log(petByLevel.hunger);
        // 1레벨 펫을 가져옴
        // {
        //     _id: new ObjectId("64e6c6519b632828d15ad759"),
        //     petName: '새싹',
        //     level: 1,
        //     experience: 300,
        //     hunger: 120,
        //     affection: 120,
        //     cleanliness: 120,
        //     condition: 120,
        //     createdAt: 2023-08-24T02:54:09.087Z,
        //     updatedAt: 2023-08-24T02:54:09.087Z
        //   }
        if (!petByLevel) {
            throw new Error(`Pet information not found for level: ${level}`);
        }

        const maxStatuses = {
            _id: petByLevel._id,
            petName: userPetName,
            hunger: petByLevel.hunger,
            affection: petByLevel.affection,
            cleanliness: petByLevel.cleanliness,
            condition: petByLevel.condition
        };
        //{ hunger: 120, affection: 120, cleanliness: 120, condition: 120 }
        return maxStatuses;
    }

    async getMaxExperienceByPetLevel(level) {
        //레벨이 0인 경우
        const petByLevel = await this.getPetByLevel(level);

        if (!petByLevel) {
            throw new Error(`Pet information not found for level: ${level}`);
        }
        // console.log(petByLevel.experience); //100
        return petByLevel.experience;
    }

    async deletePetInMyPet(petStorageId, myPetId) {
        const petStorage = await this.myPetModel.findByPetStorageId(
            petStorageId
        );

        if (!petStorage) {
            throw new Error('petStorage not found');
        }
        const updatedMyPets = petStorage.pets.filter(
            (pet) => pet._id.toString() !== myPetId
        );

        return await this.myPetModel.update(petStorageId, {
            pets: updatedMyPets
        });
    }
}
export default MyPetService;
