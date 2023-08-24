import { MyPetModel, PetModel } from '../db/models/index.js';
import { PetService } from './index.js';
import mongoose from 'mongoose';

class MyPetService {
    constructor() {
        this.myPetModel = new MyPetModel();
        this.petService = new PetService();
        this.petModel = new PetModel();
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

    async updatePetWithItemEffect(userId, statuses, effect, experience) {
        // 64e6d41a3a66926a9ec9fb47
        // [ 'hunger' ]
        // 30
        // 80
        const petStorageId = await this.getPetStorageIdByUserId(userId);
        //console.log(petStorageId);
        //64e6d41a3a66926a9ec9fb4e
        const petStorage = await this.getPetStorageByPetStorageId(petStorageId);
        //console.log(petStorage);
        // {
        //     _id: new ObjectId("64e6d41a3a66926a9ec9fb4e"),
        //     userId: new ObjectId("64e6d41a3a66926a9ec9fb47"),
        //     pets: [ { pet: [Object], _id: new ObjectId("64e6d41a3a66926a9ec9fb4f") } ],
        //     createdAt: 2023-08-24T03:52:58.270Z,
        //     updatedAt: 2023-08-24T03:54:43.735Z
        //   }
        const updatedPet = { ...petStorage };
        const myPetExperience = updatedPet.pets[0].pet.experience;
        const myPetLevel = updatedPet.pets[0].pet.level;
        let myPetHunger = updatedPet.pets[0].pet.hunger;
        let myPetAffection = updatedPet.pets[0].pet.affection;
        let myPetCleanliness = updatedPet.pets[0].pet.cleanliness;
        let myPetCondition = updatedPet.pets[0].pet.condition;
        //console.log(updatedPet.pets[0].pet.level); // 0
        //console.log(updatedPet.pets[0].pet.experience) // 100

        // 경험치에 아이템 경험치를 더해줌
        const updateMyPetExperience = myPetExperience + experience;
        // console.log(updateMyPetExperience);
        //180
        // console.log(myPetLevel);
        //0
        // 경험치가 최대 경험치를 넘어가면 레벨 업 처리
        const maxExperience = await this.getMaxExperienceByPetLevel(myPetLevel); //0레벨 펫의 maxExperience는 100 임
        if (updateMyPetExperience >= maxExperience) {
            // 업데이트 된 펫의 경험치가 최대 경험치보다 크거나 같으면
            const updateMyPetLevel = myPetLevel + 1;
            //console.log(updateMyPetLevel);
            //펫 레벨을 1 올림

            // 레벨에 따른 상태 최대치 업데이트
            const maxStatuses = await this.getMaxStatusesByPetLevel(
                updateMyPetLevel
            );
            //console.log(maxStatuses);
            //{ hunger: 120, affection: 120, cleanliness: 120, condition: 120 }
            //이렇게 저장되니 펫의 정보를 업데이트 해준다

            myPetHunger = maxStatuses.hunger;
            myPetAffection = maxStatuses.affection;
            myPetCleanliness = maxStatuses.cleanliness;
            myPetCondition = maxStatuses.condition;
            console.log(myPetHunger);
            console.log(myPetAffection);
            //여기까지가 마이펫 경험가 레벨별 최대 경험치보다 높으면 레벨과 상태를 업데이트함
        } else {
            // 여기서부터 아이템 써서 상태 업데이트
            // statuses는 아이템의 효과 [배고픔, 청결, 애정, 컨디션] 중 선택
            statuses.forEach((status) => {
                if (updatedPet.pets[0].pet.status !== undefined) {
                    updatedPet[status] = Math.min(
                        updatedPet[status] + effect,
                        updatedPet[status]
                    );
                }
            });

            // 펫 정보 업데이트
            return await this.updatePetInMyPet(
                petStorageId,
                updatedPet._id,
                updatedPet
            );
        }
    }

    async getMaxStatusesByPetLevel(level) {
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
            hunger: petByLevel.hunger,
            affection: petByLevel.affection,
            cleanliness: petByLevel.cleanliness,
            condition: petByLevel.condition
        };
        //console.log(maxStatuses);
        //{ hunger: 120, affection: 120, cleanliness: 120, condition: 120 }
        return maxStatuses;
    }

    async getMaxExperienceByPetLevel(level) {
        //레벨이 0인 경우
        const petByLevel = await this.getPetByLevel(level);
        // console.log(petByLevel);
        // {
        //     _id: new ObjectId("64e6c64a9b632828d15ad757"),
        //     petName: '씨앗',
        //     level: 0,
        //     experience: 100,
        //     hunger: 100,
        //     affection: 100,
        //     cleanliness: 100,
        //     condition: 100,
        //     createdAt: 2023-08-24T02:54:02.648Z,
        //     updatedAt: 2023-08-24T02:54:02.648Z
        //   }
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
