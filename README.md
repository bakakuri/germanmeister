# Deutsch Weg

გერმანულის სასწავლო საიტი: HTML + CSS + JS, ბიბლიოთეკების გარეშე.
ბაზა არის JSON ფაილები, რომლებიც იტვირთება ეტაპობრივად (მხოლოდ საჭირო დღე, ასო ან თემა).

## გაშვება

საიტი JSON-ს და ES მოდულებს ტვირთავს, ამიტომ სერვერი სჭირდება (ფაილზე ორჯერ დაჭერით არ იმუშავებს):

```
npx serve .
# ან
python3 -m http.server 8000
```

## მონაცემების დამატება

ახალი დღის დასამატებლად (მაგ. A1 დღე 3) შექმენი ფაილები:

| ფაილი | რა არის |
| --- | --- |
| `data/days/a1/day-003.json` | დღის გეგმა: სათაური, სიტყვების id-ები, გრამატიკა, დიალოგი, წერა |
| `data/words/a1/day-003.json` | ამ დღის სიტყვები (სრული ჩანაწერებით) |
| `data/exercises/a1/day-003.json` | სავარჯიშოები |
| `data/grammar/a1/g-a1-003.json` | გრამატიკის თემა |

შემდეგ გაუშვი:

```
npm run data      # ინდექსების აგება + შემოწმება
```

`build:data` ქმნის ლექსიკონის ასო-ფაილებს (`data/dict/`), პრაქტიკის სიებს (`data/practice/`),
გრამატიკის სიას და ავსებს `data/index.json`-ში `ready` მასივს.
`validate` ამოწმებს id-ებს, ფონეტიკის სიმბოლოებს და იმას, რომ მაგალითებში მხოლოდ
იმ დღემდე ნასწავლი სიტყვებია (არტიკლები და სახელები `data/meta/function-words.json`-შია).

ახალ ფაილებს რომ ბრაუზერი ხელახლა აიღებდეს, გაზარდე `DATA_VERSION` ფაილში `js/config.js`.

## სიტყვის ჩანაწერი

```json
{
  "id": "a1-00007",
  "level": "A1",
  "day": 2,
  "de": "Haus",
  "pos": "noun",
  "article": "das",
  "gender": "n",
  "plural": "Häuser",
  "ph": "ჰაუს",
  "ka": ["სახლი"],
  "forms": [],
  "topic": "wohnen",
  "freq": 7,
  "example": {
    "id": "s-a1-00007-1",
    "de": "Das Haus ist groß.",
    "ph": "დას ჰაუს ისტ გროს.",
    "ka": "სახლი დიდია.",
    "uses": ["a1-00007", "a1-00003", "a1-00008"]
  },
  "related": { "syn": [], "ant": [], "family": [] },
  "note": ""
}
```

- `id` უცვლელია; პროგრესი და გამეორება მასზე უნდა მიება.
- ზმნებისთვის და ზედსართავებისთვის `forms` მასივში ჩაწერე ყველა ფორმა
  (`bin, bist, ist…`), რომ შემმოწმებელმა წინადადებაში ამოიცნოს.
- `uses` — მაგალითში გამოყენებული სიტყვების id-ები. ისინი უნდა ისწავლებოდეს
  იმავე ან უფრო ადრეულ დღეს.

## პარამეტრები (`js/config.js`)

- `USE_STORAGE: false` — ტესტ-რეჟიმი, პროგრესი მხოლოდ მეხსიერებაშია. `true`-ზე ინახება `localStorage`-ში.
- `DEV_PANEL: true` — ზედა მარჯვენა კუთხეში ბორბალი: დღეზე გადახტომა, ყველაფრის ნასწავლად მონიშვნა, განულება.

## სტრუქტურა

```
index.html
css/        base, theme, layout, components/*
js/         main, config, router, state, storage, theme
  data/       loader (ჩატვირთვა და ქეში)
  components/ calendar, lesson, wordcard, carousel, exercises, dict, grammar, practice, phonetics, devpanel, header, tabbar
  utils/      dom, icons, audio, text
data/       index, plan, phonetics, days/, words/, exercises/, grammar/, dict/*, practice/* (dict და practice აგენერირდება)
tools/      build-index.mjs, validate.mjs
```
