// make a User Modal

export default class User {
    private _id: string;
    private _name: string;
    private _email: string;
    private _imageURL: string;

    constructor(id: string, name: string, email: string, imageURL: string) {
        this._id = id;
        this._name = name;
        this._email = email;
        this._imageURL = imageURL;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get email() {
        return this._email;
    }

    get imageURL() {
        return this._imageURL;
    }

}