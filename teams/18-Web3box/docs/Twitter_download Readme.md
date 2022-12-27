## About The Twitter Download & Sentiment analysis

Twitter Download and Comment Sentiment Analysis is a powerful tool for analyzing the risk of Web 3.0 projects and any regular Twitter accounts.

## Features

- No need for a Twitter Developer API;
- there are no limits on the number of downloaded posts
- multiple variables are available
- use machine learning models for sentiment analysis.

## Environment

1. Python 3.8 or higher
2. [snscrape](https://github.com/JustAnotherArchivist/snscrape), a social networking service scraper in python, used for downloading tweets, hashtags, followers, etc

## Quick Start

The script can be executed directly on Colab or another Python IDE, such as Jupyter.

### Download tweets from a specific project account

1. Find the username of the Twitter account you want to scrape, for example, “MoonbeamNetwork”, and the date range: “until: 2022-12-24 since: 2022-11-24”.
2. Define the variables you want to include in the downloaded dataframe, such as Date, FollowersCount, likeCount, and more.

```python
Moonbeam_query = "(from:MoonbeamNetwork) until:2022-12-24 since:2022-11-24"  
# Twitter account and date range
tweets = []
limit = 5000

for tweet in sntwitter.TwitterSearchScraper(Moonbeam_query).get_items():
    
    # print(vars(tweet))
    # break
    if len(tweets) == limit:
        break
    else:
        tweets.append([tweet.date, tweet.username, tweet.content, tweet.user.followersCount, tweet.likeCount,tweet.url])
        
df_moonbeam = pd.DataFrame(tweets, columns=['Date', 'User', 'Tweet', 'FollowersCount', 'likeCount','url'])
```

![](F:\我的量化\Risk_protocol\测试\QQ图片20221227122337.png)

### Download tweets containing one or more hashtags.

Use the tweet_hashtag_scrapper and remember to add hashtags in parentheses, for example: (#Moonbeam). To scrape a list of hashtags, use 'OR' (#example1 OR #example2).

```python
Moonbeam_df = tweet_hashtag_scrapper('(#Moonbeam) since:2022-09-20 until:2022-12-20', 200)
Moonbeam_df.head(5)
```

![](F:\我的量化\Risk_protocol\15个项目的推特\2.png)

### Calculate the weekly growth rate of followers

Group the data from the downloaded dataframe by week, then calculate the weekly followers growth rate by comparing the sum of followers each week.

input:

```python
#convert the 'Date' column to datetime objects
df_moonbeam['only_date'] = pd.to_datetime(df_moonbeam['only_date'])

# group the data by week
df_moonbeam_weekly = df_moonbeam.groupby(df_moonbeam['only_date'].dt.week).sum()  ## compare the user growth rate by the total number of week

# Calculate the weekly user growth rate
df_moonbeam_weekly['growth_rate'] = df_moonbeam_weekly['FollowersCount'].pct_change()

df_moonbeam_weekly.head(10)
```

output:

![](F:\我的量化\Risk_protocol\15个项目的推特\3.png)

### Carry out followers' sentiment analysis

The most popular NLP tweets sentiment analysis model in 2022 is Roberta. For more information, see [here](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment).

1. Load the model

```python
# load model and tokenizer
roberta = "cardiffnlp/twitter-roberta-base-sentiment"

model = AutoModelForSequenceClassification.from_pretrained(roberta)
tokenizer = AutoTokenizer.from_pretrained(roberta)

labels = ['Negative', 'Neutral', 'Positive']
```

1. Define a function

```python
def twitter_sentiment(tweet):
  tweet_words = []
  for word in tweet.split(' '):
      if word.startswith('@') and len(word) > 1:
          word = '@user'
      elif word.startswith('http'):
          word = "http"
      tweet_words.append(word)
  tweet_proc = " ".join(tweet_words)
  encoded_tweet = tokenizer(tweet_proc, return_tensors='pt')
  output = model(**encoded_tweet)
  scores = output[0][0].detach().numpy()
  scores = softmax(scores)
  def sentiment_evalue (scores):
    max_score = np.argmax(scores)
    if max_score == 0:
      return "Negative"
    elif max_score == 1:
      return "Neutral"
    else:
      return "Positive"
  return sentiment_evalue(scores)
```

1. Apply the function above to the Twitter content.

```python
Moonbeam_df['sentiment_analysis'] = Moonbeam_df['Content'].apply(twitter_sentiment)
```

Twitter download and comment sentiment analysis tool, valuable for Web 3.0 project’s risk analysis.

## Version history

Initial Release 1.0

## Authors

Contributors name

https://github.com/MonicaArnaud

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

