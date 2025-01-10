export default {
  SALES: "オークション",
  SIGN_IN_WITH_ETHEREUM: "Ethereumアドレスでログイン",
  SIGN_IN_WITH_ETHEREUM_AS_SAFE: "Safeアカウントとしてログイン",
  CONNECT_WALLET: "ウォレットの接続",
  CONNECT_SAFE_SIGNER_WALLET: "Safeオーナーのウォレットへ接続",
  DASHBOARD: "ダッシュボード",
  SIGNED_IN_AS: "{{address}}でログイン中",
  SIGN_OUT_AND_DISCONNECT: "ログアウト & 切断",
  DISCONNECT: "切断",
  APP_NAME: "Yamawake",
  AN_INCLUSIVE_AND_TRANSPARENT_TOKEN_LAUNCHPAD:
    "パーミッションレスで公平な販売モデルを提供する、\n包括的で透明性のあるトークンローンチパッド",
  VIEW_ALL_SALES: "すべてのオークションを見る",
  LIVE_SALES: "開催中のオークション",
  ALLOCATED_TO_THE_SALE: "オークションへの割当",
  TOTAL_RAISED: "総入札額",
  MINIMUM_TOTAL_RAISED: "最低入札額",
  NOT_STARTED: "開催前",
  LIVE: "開催中",
  ENDED: "終了",
  STARTS_IN: "開催まで",
  ENDS_IN: "終了まで",
  DAYS_AND_TIME: "{{day}}日 + {{time}}",
  LIVE_UPCOMING_SALES: "開催中 & 今後開催するオークション",
  ENDED_SALES: "終了したオークション",
  STARTING_AT: "開催日時: {{datetime}}",
  UNTIL: "終了日時: {{datetime}}",
  FINISHED: "終了しました",
  FINISHED_SUCCESS: "成功しました 🎉",
  FINISHED_FAIL: "最低入札額に到達しませんでした 😔",
  DISCLAIMERS_TERMS_AND_CONDITIONS: "免責事項・利用規約",
  CONTRIBUTE_AMOUNT: "入札額",
  CONTRIBUTE: "入札する",
  INPUT_THE_AMOUNT_YOU_WISH_TO_CONTRIBUTE: "希望入札額を入力してください",
  ESTIMATED_AMOUNT_YOU_WILL_RECEIVE: "推定割当トークン額",
  AMOUNT_YOU_WILL_RECEIVE: "割当トークン額",
  YOUR_CONTRIBUTED_AMOUNT: "あなたの合計入札額",
  THE_ESTIMATED_TOKEN_AMOUNT_IS_LESS_THAN_THE_PERMITTED_NUMBER_OF_DECIMALS:
    "推定割当額が許容された最小桁より小さくなっています",
  CLAIM: "請求",
  CLAIM_REFUND: "返金を請求",
  CLAIMED: "請求済み",
  OWNER_MENU: "オーナーメニュー",
  TOKEN_BALANCE_IN_SALE_CONTRACT: "オークションコントラクトのトークン残高",
  TOKEN_WITHDRAWALS_WILL_BE_AVAILABLE_IMMEDIATELY_AFTER_THE_END_OF_THE_SALE:
    "オークションが最低入札額に満たなかった場合、オークション期間終了後すぐにトークンを回収できます。",
  WITHDRAW_TOKEN: "トークンを回収する",
  TOTAL_RAISED_BALANCE_IN_SALE_CONTRACT: "オークションコントラクトのETH残高",
  AFTER_THE_SALE_CLOSES:
    "オークション終了時、トークン割当が0になる入札者がいる場合、入札資金の回収に三日間の待機期間が発生します。（割当0の入札者は三日以内で返金請求が可能です）",
  ONE_PERCENT_FEE_WILL_BE_SUBTRACTED: "1%の手数料が差し引かれます",
  WITHDRAW_THE_TOTAL_RAISED: "ETHを回収する",
  YOUR_SALES: "あなたのオークション",
  PARTICIPATED_SALES: "参加したオークション",
  CREATE_NEW_SALE: "オークションの作成",
  EDIT: "編集",
  DEPLOY_CONTRACT: "コントラクトのデプロイ",
  INPUT_INFORMATION: "オークション情報の入力",
  SELECT_SALE_TEMPLATE: "テンプレートを選択",
  YOU_CAN_CHOOSE_THE_TYPE_OF_TOKEN_SALE: "トークンオークションのタイプを選択できます",
  TOKEN_ADDRESS: "トークンアドレス",
  INPUT_THE_ADDRESS_OF_THE_TOKEN_YOU_WOULD_LIKE_TO_ALLOCATE_TO_THIS_SALE:
    "このオークションで配布するトークンのアドレスを入力してください。\nこのオークションテンプレートは、標準的なERC20トークンのみを扱うことができます。特殊な機能を持つトークン（リベーストークンやfee-on-transferトークンなど）のオークションはお勧めしません。",
  DONT_HAVE_A_TOKEN_YET: "トークンをお持ちでないですか？",
  START_DATE_END_DATE: "開始日時 - 終了日時",
  INPUT_THE_DURATION_OF_THE_TOKEN_SALE:
    "オークションの期間を入力してください。オークションが成功し、トークン割当が0になる入札者がいない場合、入札されたETHはオークション終了直ちに引き出すことができます。トークン割当が0になる入札者がいる場合は3日間の待機期間が発生します。オークションが失敗した場合、トークンはオークション終了直後に直ちに引き出すことができます。",
  ALLOCATION_TO_THE_SALE: "オークションへの割当",
  INPUT_THE_AMOUNT_OF_TOKENS_TO_BE_ALLOCATED:
    "オークションへのトークン割当額を入力してください。オークション終了時、トークン割当が0になる入札者がいる場合、入札資金の回収に三日間の待機期間が発生します（割当0の入札者は三日以内で返金請求が可能です）。十分な数量のトークンをオークションにご用意いただくか、小数点以下８桁以上のトークンを推奨致します。",
  THE_TOKEN_ALLOCATION_AMOUNT_IS_TOO_SMALL:
    "割当量が小さすぎるため、一部の参加者への割当が最小桁以下になり返金が必要になる可能性があります。返金者に割当てられたトークン回収不可能になります。割当量を増やすことを検討してください。",
  THE_SALE_WILL_BE_VOID_IF_THE_TOTAL_RAISED_IS_LESS_THAN_THIS_THRESHOLD:
    "合計入札額がこの閾値を下回る場合、オークションは無効となり、入札された金額は全額返金されます。",
  APPROVE_TOKEN: "トークンを承認",
  DEPLOY_SALE_CONTRACT: "オークションコントラクトをデプロイ",
  SALE_CONTRACT_ADDRESS: "オークションコントラクトアドレス",
  THE_ADDRESS_OF_THE_SALE_CONTRACT: "オークションコントラクトのアドレス",
  WAITING_FOR_THE_TRANSACTION_TO_BE_CONFIRMED: "トランザクションの承認を待っています...",
  TITLE: "タイトル",
  INPUT_THE_TITLE_OF_THIS_SALE: "オークションのタイトルを入力してください",
  DFGC_DONATION_EVENT: "e.g. DFGC Donation Event",
  DESCRIPTION: "説明",
  INPUT_THE_DESCRIPTION_OF_THIS_SALE: "オークションの説明を入力してください",
  EXPLAIN_YOUR_EVENT: "イベントの説明をしましょう",
  INPUT_THE_DISCLAIMER:
    "必要な場合はこのオークションの免責事項および利用規約を入力してください。標準的な免責事項を使用するには「サンプルの免責事項を使用する」ボタンを押してください。",
  USE_SAMPLE_DISCLAIMER_TEXT: "サンプルの免責事項を使用する",
  SAMPLE_DISCLAIMER_TEXT:
    "「このトークンオークションイベントへの参加により、あなたは以下の点を認識し同意するものとします。\n- このプロトコルの利用は法的管轄に依存し、自己責任で行われるものであることを理解しています。\n- このプロトコルは特定の法律や規制に準拠することを意図していません。\n- すべての利用者に対して同じように機能します。また、バグや問題が発生した場合には、関係者はいかなる瑕疵に対しても責任を負わないものとします。」",
  TARGET_TOTAL_RAISED: "目標入札額",
  SET_THE_TARGET_AMOUNT:
    "このオークションで達成したい目標金額を設定してください。この金額は他のユーザーに「目標入札額」として表示されます。この値はいつでも変更でき、オークション自体の成功や失敗には影響しません。",
  MAXIMUM_TOTAL_RAISED: "最大入札額（画面表示のみに利用）",
  SET_THE_MAXIMUM_TOTAL_RAISED:
    "プログレスバーの100%の値としてのみ使用される「最大合計入札額」を設定してください。この値は他の場所には表示されません。この値はいつでも変更でき、オークション自体の成功や失敗には影響しません。また、この値が達成された後でもユーザーは入札することができます。",
  PROJECT_URL: "プロジェクトURL",
  INPUT_YOUR_PROJECT_URL_IF_YOU_HAVE_IT: "プロジェクトのURLがあれば入力してください",
  PROJECT_LOGO_URL: "プロジェクトのロゴURL",
  INPUT_YOUR_PROJECT_LOGO_URL_IF_YOU_HAVE_IT:
    "プロジェクトのロゴURLがあれば入力してください。GyazoやImgur、Google Driveといったサービスで画像をアップロードすることでURLを発行できます。",
  OTHER_URL: "その他のURL",
  INPUT_ANY_URL_IF_YOU_WANT_TO_SHOW_SOMETHING_TO_USERS:
    "その他、オークションページに表示したいリンクがあれば入力してください。",
  PLEASE_WAIT_FOR_THE_TRANSACTION_TO_BE_CONFIRMED: "トランザクションが承認されるのをお待ちください",
  SAVE_SALE_INFORMATION: "オークション情報を保存",
  SKIP: "スキップする（後で入力できます）",
  UPDATE_SALE_INFORMATION: "オークション情報を更新",
  TRANSACTION_SENT: "トランザクションを送信しました",
  TRANSACTION_CONFIRMED: "トランザクションが承認されました",
  APPROVAL_CONFIRMED: "トランザクションが承認されました",
  SALE_INFORMATION_SUCCESSFULLY_SAVED: "オークション情報が正常に保存されました",
  NO_LIVE_SALE: "開催中のオークションはありません",
  NO_SALE: "オークションがありません",
  LOAD_MORE_SALES: "オークションをさらに読み込む",
  PLEASE_CONNECT_TO: "{{network}}に接続してください",
  UNNAMED_SALE: "名称未設定のオークション",
  BALANCE: "残高",
  CANCEL: "キャンセル",
  CONFIRMATION: "[確認] {{network}}へのデプロイ",
  ACHIEVED: "達成しました 🎉",
  PRICE_AGAINST_ETH: "ETH建て価格",
  JOIN_AUCTION: "オークションに参加する",
  MANAGE_AUCTION: "オークションを管理する",
  CREATE_AUCTION: "オークションを作成する",
  EARLY_USER_REWARD: "初期ユーザリワード",
  EARLY_USER_REWARD_HELP:
    "初期ユーザは、YMWKトークンを報酬として受け取る権利が付与されます。\n\n(オークション参加者)\nオークションで購入したトークンの請求時に入札金額に応じて付与されます。\n\n(オークション開催者)\nオークションの終了後、売上を回収する際に売上金額に応じて付与されます。\n\n初期ユーザリワードの予算5000万YMWKがなくなり次第終了となり、予算が尽きている場合は権利を保有していても請求は出来ません。",
  CLAIMABLE: "請求可能額",
  VE_YMWK: "veYMWK",
  VE_YMWK_REWARD: "veYMWKリワード",
  VE_YMWK_REWARD_HELP:
    "YMWKトークンを一定期間ロックすることで、移転不可のveYMWKトークンを発行します。ロック期間の最小単位は1週間、最大期間は52週間(≒ 4年間)で、ロックしたYMWKトークンはロック期間終了まで引き出しできません。\n1YMWKを4年間ロックすると1veYMWKが発行され、時間経過により線形に減衰し、4年後に0veYMWKになります。週は毎週木曜日0時(UTC)を起点として計算されます。",
  YMWK_LOCKED: "ロック中のYMWK",
  LOCKED_UNTIL: "ロック終了日時",
  REWARDS: "リワード",
  REWARDS_HELP:
    "veYMWKの保有者に対するリワードとして、YMWKトークンの新規発行分とオークションからのFee収入が各週開始時点のveYMWK保有額に応じて分配されます。",
  COMMING_SOON: "Comming soon...",
  RAW_DATA: "トランザクションデータ",
  TEMPLATE: "テンプレート",
  TOO_SMALL_ALLOCATION:
    "トークンの割当て量が少なすぎるため、一部の参加者はトークンの割当てが0（最小単位より少ない額）になる可能性があります。割当てが0になった参加者は、返金の申請をすることができます。割当て量を増やすことを検討してください。各入札者へのトークン割り当ては、切り捨てで計算され、端数（最小単位より少ない額）の合計額は、永遠にコントラクトにロックされ、引き出しできないことにご注意ください。",
  TARGET_TOTAL_RAISED_EXPLANATION:
    "このオークションの目標入札額です。目標入札額を達成した後も入札は可能です。",
  TEMPLATE_EXPLANATION: "各テンプレートの説明 ",
  SIGN_SAFE_ACCOUNT: "このページから離れずにSafeアカウントで署名してください",
  SWITCH_NETWORK_TO: "{{chainName}}へ切り替え",
  CONNECTION_CHANGE_DETECTED: "接続が変更されたためログアウトしました。再度ログインしてください",
  CCIP_FEE_PAYMENT_TOKEN: "CCIP手数料支払いトークン",
  CCIP_FEE_PAYMENT_TOKEN_HELP:
    "Cross-Chain Interoperability Protocol (CCIP)を利用して{{sourceChainName}}のリワードスコアを{{destinationChainName}}に送信します。CCIP手数料はETH, WETH, LINKで支払いが可能です。",
  CLAIM_REWARD_WHILE_TRANSFERING_SCORES_TO_L1: "L1へのスコア移行と同時にリワードを請求する",
  CLAIM_REWARD_WHILE_TRANSFERING_SCORES_TO_L1_HELP:
    "OFFにするとリワードスコアの送信だけを実行します。この場合、リワードの請求は{{destinationChainName}}で行う必要があります。",
  FEE: "手数料",
  TRANSFER_SCORE_TO_L1_WITH_CLAIM: "リワードスコアをL1に送信し、請求する",
  TRANSFER_SCORE_TO_L1: "リワードスコアをL1に送信する",
  PAST_TRANSACTION: "過去のトランザクション",
  OWNER: "オーナー",
  ADD_TOKEN: "{{symbol}}をウォレットに追加",
  SAFE_TRANSACTION_PROPOSED: "Safeアカウントでトランザクションを提案しました",
  NEXT: "次へ",
  SAFE_ADDRESS: "Safeアカウントアドレス",
  SAFE_ADDRESS_HELP: "Safeアカウントのマルチシグアドレスを入力してください",
  DESTINATION_ADDRESS_ON_L1: "受取アドレス",
  DESTINATION_ADDRESS_ON_L1_HELP: "コントラクトウォレットでは受取アドレスの入力が必須です。",
  ERROR_ADDRESS_FORMAT: "アドレスの形式が正しくありません",
  ERROR_NOT_ENOUGH_BALANCE_TO_PAY_FEE: "手数料を支払うための残高が足りません",

  // VotingEscrow
  VE_CREATE_LOCK: "ロックする",
  VE_INCREASE_AMOUNT: "ロック額を増額",
  VE_INCREASE_UNLOCK_TIME: "ロック期間を延長",
  VE_WITHDRAW: "引き出す",
  INPUT_LOCK_AMOUNT: "ロック額",
  SELECT_UNLOCK_DATE: "ロック期間を選択",
};
