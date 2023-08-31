import { MyPetModel, PetModel } from '../db/models/index.js';
import { PetService, InventoryService } from './index.js';
import mongoose from 'mongoose';
import dayjs from 'dayjs';

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
    const petStorage = await this.getPetStorageById(petStorageId);
    const pet = petStorage.pets.find((p) => p._id.toString() === petId);

    if (!pet) {
      throw new Error('Pet not found in petStorage');
    }

    return pet;
  }

  async getPetStorageById(petStorageId) {
    const petStorage = await this.myPetModel.findByPetStorageId(petStorageId);

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

    const lowestLevelPet = await this.petService.getLowestLevel();
    console.log(lowestLevelPet, 'lowestLevelPet');
    lowestLevelPet.experience = 0;

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

    const petInfo = {
      petName: pet.petName,
      level: pet.level,
      experience: pet.experience,
      hunger: pet.hunger,
      affection: pet.affection,
      cleanliness: pet.cleanliness,
      condition: pet.condition
    };

    const [petStorageId, petStorage] = await Promise.all([
      this.getPetStorageIdByUserId(userId),
      this.myPetModel.findByPetStorageId(petStorageId)
    ]);

    petStorage.pets.push({
      pet: pet
    });

    const updatedPetStorage = await this.myPetModel.update(
      petStorageId,
      petStorage
    );

    return updatedPetStorage;
  }
  //업데이트 시간과 현재 시간의 차이를 계산하여 펫 status 반환
  async updatePetStatus(petStorageId) {
    const petStorage = await this.getPetStorageById(petStorageId);

    const lastUpdateTime = dayjs(petStorage.updatedAt);
    const currentTime = dayjs();

    const timeDifferenceInMinutes = currentTime.diff(lastUpdateTime, 'minute');

    const updatedPet = { ...petStorage };

    const statusFieldsToUpdate = [
      'hunger',
      'cleanliness',
      'affection',
      'condition'
    ];

    statusFieldsToUpdate.forEach((statusField) => {
      const currentValue = updatedPet.pets[0].pet[statusField];
      const valueToSubtract = timeDifferenceInMinutes * 0.05;
      updatedPet.pets[0].pet[statusField] = Math.max(
        currentValue - valueToSubtract,
        0
      );
    });

    // 데이터베이스에서 펫의 상태를 업데이트합니다.
    return await this.statusUpdatePetInMyPet(
      petStorageId,
      updatedPet.pets[0]._id,
      updatedPet
    );
  }

  //펫 정보 각각 업데이트
  async updatePetInMyPet(petStorageId, petId, updatedFields) {
    const petStorage = await this.getPetStorageById(petStorageId);

    const petToUpdate = petStorage.pets.find(
      (pet) => pet._id.toString() === petId
    );

    if (!petToUpdate) {
      throw new Error('Pet not found in petStorage');
    }

    Object.assign(petToUpdate.pet, updatedFields);

    return petToUpdate;
  }

  async updatePetWithItemEffect(
    userId,
    statuses,
    effect,
    experience,
    quantity
  ) {
    const petStorageId = await this.getPetStorageIdByUserId(userId);

    const petStorage = await this.getPetStorageById(petStorageId);
    const userPetName = petStorage.pets[0].pet.petName;

    const updatedPet = { ...petStorage };
    updatedPet.pets[0].pet.experience;
    updatedPet.pets[0].pet.level;
    updatedPet.pets[0].pet.hunger;
    updatedPet.pets[0].pet.affection;
    updatedPet.pets[0].pet.cleanliness;
    updatedPet.pets[0].pet.condition;

    // 경험치에 아이템 경험치를 더해줌
    updatedPet.pets[0].pet.experience =
      updatedPet.pets[0].pet.experience + experience * quantity;

    // 경험치가 최대 경험치를 넘어가면 레벨 업 처리
    const maxExperience = await this.getMaxExperienceByPetLevel(
      updatedPet.pets[0].pet.level
    );

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
      updatedPet.pets[0].pet.petName = maxStatuses.petName;
      updatedPet.pets[0].pet.experience = 0;
      updatedPet.pets[0].pet.hunger = maxStatuses.hunger;
      updatedPet.pets[0].pet.affection = maxStatuses.affection;
      updatedPet.pets[0].pet.cleanliness = maxStatuses.cleanliness;
      updatedPet.pets[0].pet.condition = maxStatuses.condition;
    } else if (updatedPet.pets[0].pet.level < 5) {
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
      const maxStatuses = await this.getMaxStatusesByPetLevel(
        updatedPet.pets[0].pet.level,
        userPetName
      );

      const promises = statuses.map((status) => {
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
      console.log(promises);

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
    const petStorage = await this.getPetStorageById(petStorageId);

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

    if (!petByLevel) {
      throw new Error(`Pet information not found for level: ${level}`);
    }

    const maxStatuses = {
      _id: petByLevel._id,
      petName: petByLevel.petName,
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

    return petByLevel.experience;
  }

  async deletePetInMyPet(petStorageId, myPetId) {
    const petStorage = await this.myPetModel.findByPetStorageId(petStorageId);

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

  //회원 탈퇴시 펫보관함 삭제
  async deletePetStorageByUserId(userId) {
    const petStorage = await this.getMyPet(userId);
    if (petStorage) {
      await this.myPetModel.delete(petStorage._id);
    }
  }
}
export default MyPetService;
