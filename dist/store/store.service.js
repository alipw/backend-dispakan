"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const app_utils_1 = require("../app.utils");
const fs = require("fs");
const store_entity_1 = require("./store.entity");
const users_service_1 = require("../users/users.service");
let StoreService = class StoreService {
    constructor(storeRepository, userService) {
        this.storeRepository = storeRepository;
        this.userService = userService;
    }
    async allStore(url) {
        const store = await this.storeRepository.find({
            relations: ['user'],
        });
        for (let item of store) {
            await item.convertStringToArray();
            item.url_image = `${url}/${item.filename}`;
        }
        if (store.length == 0) {
            return app_utils_1.responseTemplate('400', "store doesn't exist", {}, true);
        }
        return app_utils_1.responseTemplate('200', 'success', store);
    }
    async detailStore(id, url) {
        const store = await this.storeRepository.findOne({ where: { id: id } });
        if (!store) {
            throw new common_1.NotFoundException(`store with id ${id} not found`);
        }
        store.url_image = `${url}/${store.filename}`;
        return app_utils_1.responseTemplate('200', 'success', store);
    }
    async uploadStore(uploadStore) {
        const { file, name, address, aspek, category, id_owner, phone, omset, mediaContact, mediaOrder, } = uploadStore;
        const owner = await this.userService.userDetail(id_owner);
        const store = new store_entity_1.Store();
        store.name = name;
        store.address = address;
        store.aspek = aspek;
        if (category && category.length != 0)
            store.katagoriSaved = JSON.stringify(category);
        store.user = owner;
        store.phone = phone;
        store.omset = omset;
        if (mediaContact && mediaContact.length != 0)
            store.mediaContact = JSON.stringify(mediaContact);
        if (mediaOrder && mediaContact.length != 0)
            store.mediaOrdered = JSON.stringify(mediaOrder);
        if (uploadStore.file) {
            store.filename = file.filename;
            store.image = file.path;
        }
        await store.convertStringToArray();
        await this.storeRepository.save(store);
        return app_utils_1.responseTemplate('200', 'success', store);
    }
    async updateStore(updateStore, id) {
        const store = (await this.detailStore(id)).data;
        const owner = await this.userService.userDetail(updateStore.id_owner);
        if (updateStore.file) {
            if (fs.existsSync(store.image)) {
                fs.unlinkSync(store.image);
            }
            store.filename = updateStore.file.filename;
            store.image = updateStore.file.path;
        }
        store.name = updateStore.name;
        store.address = updateStore.address;
        store.aspek = updateStore.aspek;
        if (updateStore.category && updateStore.category.length != 0) {
            store.katagoriSaved = JSON.stringify(updateStore.category);
        }
        else {
            store.katagoriSaved = null;
        }
        store.phone = updateStore.phone;
        store.omset = updateStore.omset;
        if (updateStore.mediaContact && updateStore.mediaContact.length != 0) {
            store.mediaContact = JSON.stringify(updateStore.mediaContact);
        }
        else {
            store.mediaContact = null;
        }
        if (updateStore.mediaOrder && updateStore.mediaOrder.length != 0) {
            store.mediaOrdered = JSON.stringify(updateStore.mediaOrder);
        }
        else {
            store.mediaOrdered = null;
        }
        store.user = owner;
        await store.convertStringToArray();
        await this.storeRepository.save(store);
        return app_utils_1.responseTemplate('200', 'success', store);
    }
    async deleteStore(id) {
        let response = '';
        const store = (await this.detailStore(id)).data;
        try {
            fs.unlinkSync(store.image);
            response = `${store.createdAt}. ${store.image} deleted`;
        }
        catch (e) {
            response = `${store.createdAt}. ${store.image}, ${e.message}`;
        }
        await this.storeRepository.remove(store);
        return app_utils_1.responseTemplate('200', 'success', response);
    }
};
StoreService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(store_entity_1.Store)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], StoreService);
exports.StoreService = StoreService;
//# sourceMappingURL=store.service.js.map