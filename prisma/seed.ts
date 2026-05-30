import { PrismaClient, Confederation, PlayerPosition, PlayerRarity } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter })

// FIFA World Cup 2026 — 48 qualified teams
const teams: Array<{
  fifaCode: string
  name: string
  group: string
  confederation: Confederation
  players: Array<{ name: string; position: PlayerPosition; number: number; rarity: PlayerRarity }>
}> = [
  // GROUP A
  {
    fifaCode: 'us',
    name: 'Estados Unidos',
    group: 'A',
    confederation: 'CONCACAF',
    players: [
      { name: 'Matt Turner', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Sergino Dest', position: 'DEF', number: 2, rarity: 'RARE' },
      { name: 'Tyler Adams', position: 'MID', number: 4, rarity: 'RARE' },
      { name: 'Christian Pulisic', position: 'FWD', number: 10, rarity: 'LEGEND' },
      { name: 'Ricardo Pepi', position: 'FWD', number: 9, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'mx',
    name: 'México',
    group: 'A',
    confederation: 'CONCACAF',
    players: [
      { name: 'Guillermo Ochoa', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Edson Álvarez', position: 'MID', number: 6, rarity: 'LEGEND' },
      { name: 'Hirving Lozano', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Raúl Jiménez', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Jorge Sánchez', position: 'DEF', number: 2, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'ca',
    name: 'Canadá',
    group: 'A',
    confederation: 'CONCACAF',
    players: [
      { name: 'Milan Borjan', position: 'GK', number: 18, rarity: 'COMMON' },
      { name: 'Alphonso Davies', position: 'DEF', number: 3, rarity: 'LEGEND' },
      { name: 'Jonathan David', position: 'FWD', number: 20, rarity: 'LEGEND' },
      { name: 'Tajon Buchanan', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Stephen Eustáquio', position: 'MID', number: 7, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'de',
    name: 'Alemania',
    group: 'A',
    confederation: 'UEFA',
    players: [
      { name: 'Manuel Neuer', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Joshua Kimmich', position: 'MID', number: 6, rarity: 'LEGEND' },
      { name: 'Jamal Musiala', position: 'MID', number: 10, rarity: 'LEGEND' },
      { name: 'Florian Wirtz', position: 'MID', number: 17, rarity: 'RARE' },
      { name: 'Kai Havertz', position: 'FWD', number: 9, rarity: 'RARE' },
    ],
  },
  // GROUP B
  {
    fifaCode: 'ar',
    name: 'Argentina',
    group: 'B',
    confederation: 'CONMEBOL',
    players: [
      { name: 'Emiliano Martínez', position: 'GK', number: 23, rarity: 'LEGEND' },
      { name: 'Lionel Messi', position: 'FWD', number: 10, rarity: 'LEGEND' },
      { name: 'Julián Álvarez', position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Rodrigo De Paul', position: 'MID', number: 7, rarity: 'RARE' },
      { name: 'Nicolás Otamendi', position: 'DEF', number: 19, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'br',
    name: 'Brasil',
    group: 'B',
    confederation: 'CONMEBOL',
    players: [
      { name: 'Alisson Becker', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Vinicius Jr.', position: 'FWD', number: 7, rarity: 'LEGEND' },
      { name: 'Rodrygo', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Casemiro', position: 'MID', number: 5, rarity: 'RARE' },
      { name: 'Marquinhos', position: 'DEF', number: 4, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'fr',
    name: 'Francia',
    group: 'B',
    confederation: 'UEFA',
    players: [
      { name: 'Mike Maignan', position: 'GK', number: 16, rarity: 'COMMON' },
      { name: 'Kylian Mbappé', position: 'FWD', number: 10, rarity: 'LEGEND' },
      { name: 'Antoine Griezmann', position: 'FWD', number: 7, rarity: 'LEGEND' },
      { name: "N'Golo Kanté", position: 'MID', number: 13, rarity: 'LEGEND' },
      { name: 'Aurélien Tchouaméni', position: 'MID', number: 8, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'ma',
    name: 'Marruecos',
    group: 'B',
    confederation: 'CAF',
    players: [
      { name: 'Yassine Bounou', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Achraf Hakimi', position: 'DEF', number: 2, rarity: 'LEGEND' },
      { name: 'Hakim Ziyech', position: 'MID', number: 7, rarity: 'RARE' },
      { name: 'Youssef En-Nesyri', position: 'FWD', number: 19, rarity: 'RARE' },
      { name: 'Sofyan Amrabat', position: 'MID', number: 4, rarity: 'RARE' },
    ],
  },
  // GROUP C
  {
    fifaCode: 'es',
    name: 'España',
    group: 'C',
    confederation: 'UEFA',
    players: [
      { name: 'Unai Simón', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Pedri', position: 'MID', number: 8, rarity: 'LEGEND' },
      { name: 'Lamine Yamal', position: 'FWD', number: 19, rarity: 'LEGEND' },
      { name: 'Rodri', position: 'MID', number: 16, rarity: 'LEGEND' },
      { name: 'Álvaro Morata', position: 'FWD', number: 7, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'pt',
    name: 'Portugal',
    group: 'C',
    confederation: 'UEFA',
    players: [
      { name: 'Diogo Costa', position: 'GK', number: 1, rarity: 'RARE' },
      { name: 'Cristiano Ronaldo', position: 'FWD', number: 7, rarity: 'LEGEND' },
      { name: 'Bruno Fernandes', position: 'MID', number: 8, rarity: 'LEGEND' },
      { name: 'Rafael Leão', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Rúben Dias', position: 'DEF', number: 3, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'sn',
    name: 'Senegal',
    group: 'C',
    confederation: 'CAF',
    players: [
      { name: 'Édouard Mendy', position: 'GK', number: 1, rarity: 'RARE' },
      { name: 'Sadio Mané', position: 'FWD', number: 10, rarity: 'LEGEND' },
      { name: 'Kalidou Koulibaly', position: 'DEF', number: 3, rarity: 'RARE' },
      { name: 'Idrissa Gueye', position: 'MID', number: 5, rarity: 'RARE' },
      { name: 'Ismaïla Sarr', position: 'FWD', number: 23, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'ec',
    name: 'Ecuador',
    group: 'C',
    confederation: 'CONMEBOL',
    players: [
      { name: 'Hernán Galíndez', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Enner Valencia', position: 'FWD', number: 13, rarity: 'LEGEND' },
      { name: 'Moisés Caicedo', position: 'MID', number: 10, rarity: 'LEGEND' },
      { name: 'Piero Hincapié', position: 'DEF', number: 5, rarity: 'RARE' },
      { name: 'Ángel Mena', position: 'FWD', number: 11, rarity: 'RARE' },
    ],
  },
  // GROUP D
  {
    fifaCode: 'gb-eng',
    name: 'Inglaterra',
    group: 'D',
    confederation: 'UEFA',
    players: [
      { name: 'Jordan Pickford', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Harry Kane', position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Jude Bellingham', position: 'MID', number: 10, rarity: 'LEGEND' },
      { name: 'Phil Foden', position: 'MID', number: 11, rarity: 'LEGEND' },
      { name: 'Bukayo Saka', position: 'FWD', number: 7, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'nl',
    name: 'Países Bajos',
    group: 'D',
    confederation: 'UEFA',
    players: [
      { name: 'Bart Verbruggen', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Virgil van Dijk', position: 'DEF', number: 4, rarity: 'LEGEND' },
      { name: 'Memphis Depay', position: 'FWD', number: 10, rarity: 'RARE' },
      { name: 'Cody Gakpo', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Tijjani Reijnders', position: 'MID', number: 14, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'co',
    name: 'Colombia',
    group: 'D',
    confederation: 'CONMEBOL',
    players: [
      { name: 'Camilo Vargas', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'James Rodríguez', position: 'MID', number: 10, rarity: 'LEGEND' },
      { name: 'Luis Díaz', position: 'FWD', number: 7, rarity: 'LEGEND' },
      { name: 'Radamel Falcao', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Richard Ríos', position: 'MID', number: 8, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'ng',
    name: 'Nigeria',
    group: 'D',
    confederation: 'CAF',
    players: [
      { name: 'Stanley Nwabali', position: 'GK', number: 16, rarity: 'COMMON' },
      { name: 'Victor Osimhen', position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Ola Aina', position: 'DEF', number: 3, rarity: 'RARE' },
      { name: 'Wilfred Ndidi', position: 'MID', number: 4, rarity: 'RARE' },
      { name: 'Samuel Chukwueze', position: 'FWD', number: 14, rarity: 'RARE' },
    ],
  },
  // GROUP E
  {
    fifaCode: 'it',
    name: 'Italia',
    group: 'E',
    confederation: 'UEFA',
    players: [
      { name: 'Gianluigi Donnarumma', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Federico Chiesa', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Sandro Tonali', position: 'MID', number: 8, rarity: 'RARE' },
      { name: 'Giacomo Raspadori', position: 'FWD', number: 10, rarity: 'RARE' },
      { name: 'Alessandro Bastoni', position: 'DEF', number: 23, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'be',
    name: 'Bélgica',
    group: 'E',
    confederation: 'UEFA',
    players: [
      { name: 'Thibaut Courtois', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Kevin De Bruyne', position: 'MID', number: 7, rarity: 'LEGEND' },
      { name: 'Romelu Lukaku', position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Yannick Carrasco', position: 'MID', number: 11, rarity: 'RARE' },
      { name: 'Axel Witsel', position: 'MID', number: 6, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'jp',
    name: 'Japón',
    group: 'E',
    confederation: 'AFC',
    players: [
      { name: 'Shuichi Gonda', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Takumi Minamino', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Daichi Kamada', position: 'MID', number: 7, rarity: 'RARE' },
      { name: 'Ritsu Doan', position: 'MID', number: 9, rarity: 'RARE' },
      { name: 'Junya Ito', position: 'FWD', number: 14, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'cr',
    name: 'Costa Rica',
    group: 'E',
    confederation: 'CONCACAF',
    players: [
      { name: 'Keylor Navas', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Bryan Ruiz', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Joel Campbell', position: 'FWD', number: 12, rarity: 'RARE' },
      { name: 'Celso Borges', position: 'MID', number: 5, rarity: 'COMMON' },
      { name: 'Francisco Calvo', position: 'DEF', number: 3, rarity: 'COMMON' },
    ],
  },
  // GROUP F
  {
    fifaCode: 'hr',
    name: 'Croacia',
    group: 'F',
    confederation: 'UEFA',
    players: [
      { name: 'Dominik Livaković', position: 'GK', number: 1, rarity: 'RARE' },
      { name: 'Luka Modrić', position: 'MID', number: 10, rarity: 'LEGEND' },
      { name: 'Mateo Kovačić', position: 'MID', number: 8, rarity: 'RARE' },
      { name: 'Ivan Perišić', position: 'FWD', number: 4, rarity: 'RARE' },
      { name: 'Andrej Kramarić', position: 'FWD', number: 9, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'at',
    name: 'Austria',
    group: 'F',
    confederation: 'UEFA',
    players: [
      { name: 'Patrick Pentz', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Marcel Sabitzer', position: 'MID', number: 8, rarity: 'RARE' },
      { name: 'Marko Arnautović', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'David Alaba', position: 'DEF', number: 14, rarity: 'LEGEND' },
      { name: 'Konrad Laimer', position: 'MID', number: 17, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'au',
    name: 'Australia',
    group: 'F',
    confederation: 'AFC',
    players: [
      { name: 'Mat Ryan', position: 'GK', number: 1, rarity: 'RARE' },
      { name: 'Harry Souttar', position: 'DEF', number: 4, rarity: 'RARE' },
      { name: 'Mathew Leckie', position: 'FWD', number: 7, rarity: 'RARE' },
      { name: 'Aaron Mooy', position: 'MID', number: 13, rarity: 'RARE' },
      { name: 'Mitchell Duke', position: 'FWD', number: 20, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'ug',
    name: 'Uganda',
    group: 'F',
    confederation: 'CAF',
    players: [
      { name: 'Charles Lukwago', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Emmanuel Okwi', position: 'FWD', number: 9, rarity: 'COMMON' },
      { name: 'Allan Kateregga', position: 'MID', number: 8, rarity: 'COMMON' },
      { name: 'Murushid Juuko', position: 'DEF', number: 5, rarity: 'COMMON' },
      { name: 'Moses Waiswa', position: 'MID', number: 14, rarity: 'COMMON' },
    ],
  },
  // GROUP G
  {
    fifaCode: 'uy',
    name: 'Uruguay',
    group: 'G',
    confederation: 'CONMEBOL',
    players: [
      { name: 'Sergio Rochet', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Federico Valverde', position: 'MID', number: 8, rarity: 'LEGEND' },
      { name: 'Darwin Núñez', position: 'FWD', number: 11, rarity: 'LEGEND' },
      { name: 'Ronald Araújo', position: 'DEF', number: 2, rarity: 'RARE' },
      { name: 'Rodrigo Bentancur', position: 'MID', number: 5, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'ch',
    name: 'Suiza',
    group: 'G',
    confederation: 'UEFA',
    players: [
      { name: 'Yann Sommer', position: 'GK', number: 1, rarity: 'RARE' },
      { name: 'Xherdan Shaqiri', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Granit Xhaka', position: 'MID', number: 8, rarity: 'RARE' },
      { name: 'Breel Embolo', position: 'FWD', number: 7, rarity: 'RARE' },
      { name: 'Manuel Akanji', position: 'DEF', number: 5, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'ci',
    name: 'Costa de Marfil',
    group: 'G',
    confederation: 'CAF',
    players: [
      { name: 'Yahia Fofana', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Sébastien Haller', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Franck Kessié', position: 'MID', number: 8, rarity: 'RARE' },
      { name: 'Serge Aurier', position: 'DEF', number: 2, rarity: 'COMMON' },
      { name: 'Simon Adingra', position: 'FWD', number: 11, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'ir',
    name: 'Irán',
    group: 'G',
    confederation: 'AFC',
    players: [
      { name: 'Alireza Beiranvand', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Sardar Azmoun', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Mehdi Taremi', position: 'FWD', number: 20, rarity: 'LEGEND' },
      { name: 'Ali Gholizadeh', position: 'MID', number: 7, rarity: 'RARE' },
      { name: 'Milad Mohammadi', position: 'DEF', number: 3, rarity: 'COMMON' },
    ],
  },
  // GROUP H
  {
    fifaCode: 'dk',
    name: 'Dinamarca',
    group: 'H',
    confederation: 'UEFA',
    players: [
      { name: 'Kasper Schmeichel', position: 'GK', number: 1, rarity: 'RARE' },
      { name: 'Christian Eriksen', position: 'MID', number: 10, rarity: 'LEGEND' },
      { name: 'Pierre-Emile Højbjerg', position: 'MID', number: 23, rarity: 'RARE' },
      { name: 'Andreas Skov Olsen', position: 'FWD', number: 19, rarity: 'RARE' },
      { name: 'Simon Kjær', position: 'DEF', number: 4, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'rs',
    name: 'Serbia',
    group: 'H',
    confederation: 'UEFA',
    players: [
      { name: 'Predrag Rajković', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Aleksandar Mitrović', position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Dušan Vlahović', position: 'FWD', number: 11, rarity: 'LEGEND' },
      { name: 'Sergej Milinković-Savić', position: 'MID', number: 8, rarity: 'RARE' },
      { name: 'Nikola Milenković', position: 'DEF', number: 4, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'ke',
    name: 'Kenia',
    group: 'H',
    confederation: 'CAF',
    players: [
      { name: 'Patrick Matasi', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Michael Olunga', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Victor Wanyama', position: 'MID', number: 6, rarity: 'RARE' },
      { name: 'Arnold Origi', position: 'DEF', number: 3, rarity: 'COMMON' },
      { name: 'Ayub Timbe', position: 'MID', number: 11, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 've',
    name: 'Venezuela',
    group: 'H',
    confederation: 'CONMEBOL',
    players: [
      { name: 'Wuilker Faríñez', position: 'GK', number: 1, rarity: 'RARE' },
      { name: 'Salomón Rondón', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Josef Martínez', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Tomás Rincón', position: 'MID', number: 8, rarity: 'COMMON' },
      { name: 'Yangel Herrera', position: 'MID', number: 7, rarity: 'RARE' },
    ],
  },
  // GROUP I
  {
    fifaCode: 'pl',
    name: 'Polonia',
    group: 'I',
    confederation: 'UEFA',
    players: [
      { name: 'Wojciech Szczęsny', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Robert Lewandowski', position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Piotr Zieliński', position: 'MID', number: 20, rarity: 'RARE' },
      { name: 'Grzegorz Krychowiak', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Jan Bednarek', position: 'DEF', number: 5, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'tr',
    name: 'Turquía',
    group: 'I',
    confederation: 'UEFA',
    players: [
      { name: 'Mert Günok', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Hakan Çalhanoğlu', position: 'MID', number: 10, rarity: 'LEGEND' },
      { name: 'Arda Güler', position: 'MID', number: 17, rarity: 'LEGEND' },
      { name: 'Kerem Aktürkoğlu', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Merih Demiral', position: 'DEF', number: 3, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'sa',
    name: 'Arabia Saudita',
    group: 'I',
    confederation: 'AFC',
    players: [
      { name: 'Mohammed Al-Owais', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Salem Al-Dawsari', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Firas Al-Buraikan', position: 'FWD', number: 9, rarity: 'COMMON' },
      { name: 'Ali Al-Bulayhi', position: 'DEF', number: 13, rarity: 'COMMON' },
      { name: 'Saleh Al-Shehri', position: 'FWD', number: 7, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'cm',
    name: 'Camerún',
    group: 'I',
    confederation: 'CAF',
    players: [
      { name: 'André Onana', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: "Samuel Eto'o", position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Vincent Aboubakar', position: 'FWD', number: 10, rarity: 'RARE' },
      { name: 'Karl Toko Ekambi', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Jean-Charles Castelletto', position: 'DEF', number: 4, rarity: 'COMMON' },
    ],
  },
  // GROUP J
  {
    fifaCode: 'mx',
    name: 'México',
    group: 'J',
    confederation: 'CONCACAF',
    players: [],
  },
  {
    fifaCode: 'pe',
    name: 'Perú',
    group: 'J',
    confederation: 'CONMEBOL',
    players: [
      { name: 'Pedro Gallese', position: 'GK', number: 1, rarity: 'RARE' },
      { name: 'Paolo Guerrero', position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Christian Cueva', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Gianluca Lapadula', position: 'FWD', number: 18, rarity: 'RARE' },
      { name: 'Renato Tapia', position: 'MID', number: 5, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'eg',
    name: 'Egipto',
    group: 'J',
    confederation: 'CAF',
    players: [
      { name: 'Mohamed El-Shennawy', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Mohamed Salah', position: 'FWD', number: 11, rarity: 'LEGEND' },
      { name: 'Ahmed Sayed Zizo', position: 'MID', number: 7, rarity: 'COMMON' },
      { name: 'Trezeguet', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Mostafa Mohamed', position: 'FWD', number: 9, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'sk',
    name: 'Eslovaquia',
    group: 'J',
    confederation: 'UEFA',
    players: [
      { name: 'Marek Rodák', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Marek Hamšík', position: 'MID', number: 17, rarity: 'LEGEND' },
      { name: 'Milan Škriniar', position: 'DEF', number: 5, rarity: 'RARE' },
      { name: 'Ondrej Duda', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Róbert Boženík', position: 'FWD', number: 9, rarity: 'COMMON' },
    ],
  },
  // GROUP K
  {
    fifaCode: 'kp',
    name: 'Corea del Norte',
    group: 'K',
    confederation: 'AFC',
    players: [
      { name: 'Ri Myong-guk', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Jong Il-gwan', position: 'FWD', number: 9, rarity: 'COMMON' },
      { name: 'Pak Kwang-ryong', position: 'DEF', number: 4, rarity: 'COMMON' },
      { name: 'Kim Yu-song', position: 'MID', number: 8, rarity: 'COMMON' },
      { name: 'Om Kwang-hyok', position: 'FWD', number: 11, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'kr',
    name: 'Corea del Sur',
    group: 'K',
    confederation: 'AFC',
    players: [
      { name: 'Kim Seung-gyu', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Son Heung-min', position: 'FWD', number: 7, rarity: 'LEGEND' },
      { name: 'Lee Jae-sung', position: 'MID', number: 17, rarity: 'RARE' },
      { name: 'Kim Min-jae', position: 'DEF', number: 3, rarity: 'RARE' },
      { name: 'Hwang Hee-chan', position: 'FWD', number: 11, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'pa',
    name: 'Panamá',
    group: 'K',
    confederation: 'CONCACAF',
    players: [
      { name: 'Luis Mejía', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Rolando Blackburn', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Aníbal Godoy', position: 'MID', number: 8, rarity: 'RARE' },
      { name: 'Fidel Escobar', position: 'DEF', number: 15, rarity: 'COMMON' },
      { name: 'Cecilio Waterman', position: 'FWD', number: 11, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'nz',
    name: 'Nueva Zelanda',
    group: 'K',
    confederation: 'OFC',
    players: [
      { name: 'Oliver Sail', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Chris Wood', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Liberato Cacace', position: 'DEF', number: 5, rarity: 'RARE' },
      { name: 'Marco Rojas', position: 'MID', number: 10, rarity: 'COMMON' },
      { name: 'Clayton Lewis', position: 'MID', number: 8, rarity: 'COMMON' },
    ],
  },
  // GROUP L
  {
    fifaCode: 'gh',
    name: 'Ghana',
    group: 'L',
    confederation: 'CAF',
    players: [
      { name: 'Lawrence Ati-Zigi', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Jordan Ayew', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'André Ayew', position: 'MID', number: 10, rarity: 'RARE' },
      { name: 'Thomas Partey', position: 'MID', number: 5, rarity: 'LEGEND' },
      { name: 'Mohammed Kudus', position: 'MID', number: 14, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'hn',
    name: 'Honduras',
    group: 'L',
    confederation: 'CONCACAF',
    players: [
      { name: 'Harold Fonseca', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Anthony Lozano', position: 'FWD', number: 9, rarity: 'RARE' },
      { name: 'Alberth Elis', position: 'FWD', number: 11, rarity: 'RARE' },
      { name: 'Romell Quioto', position: 'MID', number: 7, rarity: 'COMMON' },
      { name: 'Denil Maldonado', position: 'DEF', number: 3, rarity: 'COMMON' },
    ],
  },
  {
    fifaCode: 'cl',
    name: 'Chile',
    group: 'L',
    confederation: 'CONMEBOL',
    players: [
      { name: 'Claudio Bravo', position: 'GK', number: 1, rarity: 'LEGEND' },
      { name: 'Alexis Sánchez', position: 'FWD', number: 7, rarity: 'LEGEND' },
      { name: 'Arturo Vidal', position: 'MID', number: 8, rarity: 'LEGEND' },
      { name: 'Charles Aránguiz', position: 'MID', number: 20, rarity: 'RARE' },
      { name: 'Ben Brereton Díaz', position: 'FWD', number: 11, rarity: 'RARE' },
    ],
  },
  {
    fifaCode: 'cz',
    name: 'República Checa',
    group: 'L',
    confederation: 'UEFA',
    players: [
      { name: 'Jiří Pavlenka', position: 'GK', number: 1, rarity: 'COMMON' },
      { name: 'Tomáš Souček', position: 'MID', number: 8, rarity: 'RARE' },
      { name: 'Patrik Schick', position: 'FWD', number: 9, rarity: 'LEGEND' },
      { name: 'Vladimír Coufal', position: 'DEF', number: 5, rarity: 'RARE' },
      { name: 'Ondřej Duda', position: 'MID', number: 11, rarity: 'COMMON' },
    ],
  },
]

async function main() {
  console.log('🌱 Iniciando seed...')

  // Remove duplicate Mexico (grouped in A and J by mistake — keep only group A)
  const uniqueTeams = teams.filter(
    (t, idx) => teams.findIndex((t2) => t2.fifaCode === t.fifaCode) === idx
  )

  // Upsert all teams and players
  for (const teamData of uniqueTeams) {
    if (teamData.players.length === 0) continue

    const flagUrl = `https://flagcdn.com/w80/${teamData.fifaCode.toLowerCase()}.png`

    const team = await db.team.upsert({
      where: { fifaCode: teamData.fifaCode },
      update: {
        name: teamData.name,
        group: teamData.group,
        confederation: teamData.confederation,
        flagUrl,
      },
      create: {
        fifaCode: teamData.fifaCode,
        name: teamData.name,
        group: teamData.group,
        confederation: teamData.confederation,
        flagUrl,
      },
    })

    for (const playerData of teamData.players) {
      await db.player.upsert({
        where: {
          // Use a unique constraint on teamId + number
          teamId_number: { teamId: team.id, number: playerData.number },
        },
        update: {
          name: playerData.name,
          position: playerData.position,
          rarity: playerData.rarity,
        },
        create: {
          teamId: team.id,
          name: playerData.name,
          position: playerData.position,
          number: playerData.number,
          rarity: playerData.rarity,
        },
      })
    }

    console.log(
      `✅ ${teamData.name} (Grupo ${teamData.group}) — ${teamData.players.length} jugadores`
    )
  }

  // Create demo admin user
  const adminPassword = await bcrypt.hash('Admin1234!', 12)
  await db.user.upsert({
    where: { email: 'admin@album2026.com' },
    update: {},
    create: {
      email: 'admin@album2026.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create demo regular user with album
  const userPassword = await bcrypt.hash('User1234!', 12)
  const demoUser = await db.user.upsert({
    where: { email: 'demo@album2026.com' },
    update: {},
    create: {
      email: 'demo@album2026.com',
      name: 'Demo User',
      passwordHash: userPassword,
      role: 'USER',
    },
  })

  // Create album for demo user if it doesn't exist
  let album = await db.album.findUnique({ where: { userId: demoUser.id } })
  if (!album) {
    album = await db.album.create({ data: { userId: demoUser.id } })
  }

  // Create stickers for ALL existing albums (including users already registered)
  const allPlayers = await db.player.findMany()
  const allAlbums = await db.album.findMany()

  for (const a of allAlbums) {
    for (const player of allPlayers) {
      await db.sticker.upsert({
        where: { playerId_albumId: { playerId: player.id, albumId: a.id } },
        update: {},
        create: { playerId: player.id, albumId: a.id, status: 'MISSING' },
      })
    }
  }

  console.log(`\n🎉 Seed completado!`)
  console.log(`   Equipos: ${uniqueTeams.filter((t) => t.players.length > 0).length}`)
  console.log(`   Jugadores: ${allPlayers.length}`)
  console.log(`   Álbumes actualizados: ${allAlbums.length}`)
  console.log(`   Admin: admin@album2026.com / Admin1234!`)
  console.log(`   Demo: demo@album2026.com / User1234!`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
