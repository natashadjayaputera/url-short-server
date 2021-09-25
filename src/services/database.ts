import { Sequelize } from "sequelize";
import Urls, { CreateUrlsModelAttributes } from "../models/Urls";

// INSERT INTO urls(id, original_url, is_custom) VALUES...

export class DatabaseService {
    private connection!: Sequelize
    
    // * NOTE: Singleton Pattern
    private static service: DatabaseService

    private constructor() {
        try {
            this.connection = new Sequelize({
                dialect: 'sqlite',
                storage: './db.sqlite'
            })
            this.connection.authenticate()
            this.initializeModels()

            console.log("DB connection success")
        } catch {
            console.error("DB connection failure")
        }
    }

    public static get instance(): DatabaseService {
        if(this.service === undefined) {
            this.service = new DatabaseService()
        }

        return this.service
    }

    private initializeModels(): void {
        Urls.init(Urls.getAttributes(), { sequelize: this.connection })
    }

    public async insertUrl(data: CreateUrlsModelAttributes): Promise<Urls> {
        return Urls.create(data)
    }

    public async getUrl(id: string): Promise<Urls | null>  {
        return Urls.findByPk(id)
    }

    public async incrementUrlVisitCount(id: string): Promise<Urls> {
        return Urls.increment( 'visitCount', { by: 1, where: { id } })
    }
}

//export const DBService = DatabaseService // this is for renaming