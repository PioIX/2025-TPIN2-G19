class CardCharacter {
    constructor(characterName) {
        this.characterName=characterName
    }
}

const cardsCharacters=[]
cardsCharacters.push(new Card("Señorita Escarlata"))
cardsCharacters.push(new Card("Señora Azulino"))
cardsCharacters.push(new Card ("Profesor Moradillo"))
cardsCharacters.push(new Card("Señor Verdi"))
cardsCharacters.push(new Card("Señora Blanco"))


class CardWeapons {
    constructor(weaponName){
        this.weaponName=weaponName
    }
}


const cardsWeapons=[]
cardsWeapons.push(new Card("Cuchillo"))
cardsWeapons.push(new Card("Revólver"))
cardsWeapons.push(new Card("Soga"))
cardsWeapons.push(new Card("Llave inglesa"))
cardsWeapons.push(new Card("Veneno"))


class CardRooms {
    constructor(roomName){
        this.roomName=roomName
    }
}

const cardsRooms=[]
cardsRooms.push=(new Card("Habitación"))
cardsRooms.push=(new Card("Comedor"))
cardsRooms.push=(new Card("Cocina"))
cardsRooms.push=(new Card("Baño"))
