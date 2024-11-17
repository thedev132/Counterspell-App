export default class Prize {
    private _id: string;
    private _name: string;
    private _cost: number;
    private _stock: number;

    constructor(id: string, name: string, cost: number, stock: number) {
        this._id = id;
        this._name = name;
        this._cost = cost;
        this._stock = stock;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get cost() {
        return this._cost;
    }

    get stock() {
        return this._stock;
    }
}