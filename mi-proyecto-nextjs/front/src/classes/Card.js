class CardCharacter {
    constructor(characterName) {
        this.characterName=characterName
    }
}

export const cardsCharacters=[]
cardsCharacters.push(new CardCharacter("Señorita Escarlata"))
cardsCharacters.push(new CardCharacter("Señora Azulino"))
cardsCharacters.push(new CardCharacter ("Profesor Moradillo"))
cardsCharacters.push(new CardCharacter("Señor Verdi"))
cardsCharacters.push(new CardCharacter("Señora Blanco"))


class CardWeapons {
    constructor(weaponName){
        this.weaponName=weaponName
    }
}


export const cardsWeapons=[]
cardsWeapons.push(new CardWeapons("Cuchillo"))
cardsWeapons.push(new CardWeapons("Revólver"))
cardsWeapons.push(new CardWeapons("Soga"))
cardsWeapons.push(new CardWeapons("Llave inglesa"))
cardsWeapons.push(new CardWeapons("Veneno"))


class CardRooms {
    constructor(roomName){
        this.roomName=roomName
    }
}

export const cardsRooms=[]
cardsRooms.push(new CardRooms("Habitación"))
cardsRooms.push(new CardRooms("Comedor"))
cardsRooms.push(new CardRooms("Cocina"))
cardsRooms.push(new CardRooms("Baño"))