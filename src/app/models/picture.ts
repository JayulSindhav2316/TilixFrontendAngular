export class Picture {
    personId?: number;
    image?: any;
    constructor(personId, image){
        this.personId = personId;
        this.image = image;
    }
}

export interface Image {
    previewImageSrc?;
    thumbnailImageSrc?;
    alt?;
    title?;
}
