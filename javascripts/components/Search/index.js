import React, { Component } from "react";
import Header from "components/Header";

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return <div>
      <Header />

      <div className="search_box">
        <form>
          <div className="search_bar">
              <input name="keyword" className="nude_input search_keyword" value="萌典" />
          </div>
        </form>

        <div className="result_box">
          <div className="sources_tabbar">
            <button type="button" className="tabbable nude_input source_tab source_tab_highlighted" htmlFor="fromGithub">Github</button>
            <button type="button" className="tabbable nude_input source_tab" htmlFor="fromHackpad">Hackpad</button>
            <button type="button" className="tabbable nude_input source_tab" htmlFor="fromHackfoldr">Hackfoldr</button>
          </div>

          <section className="tabbable WtabPage result_rows" id="fromGithub">
            <div className="result_row">
              <div className=""><a href="#" className="github_name">wildjcrt/moedict-extension</a></div>
              <div className="github_description">蔡中涵委員阿美語字典</div>
              <div className="highlighted_content"># amis-safolu\n\n感謝 cpyang 將 PDF 原稿轉為 TXT 檔~\n\n\n# License\n\n蔡中涵委員 g0v 阿美語<em>萌</em><em>典</em>計劃使用本字<em>典</em>，以 CC BY-NC 授權宣告。\n</div>
            </div>

            <div className="result_row">
              <div className=""><a href="#" className="github_name">wildjcrt/moedict-extension</a></div>
              <div className="github_description">蔡中涵委員阿美語字典</div>
              <div className="highlighted_content"># amis-safolu\n\n感謝 cpyang 將 PDF 原稿轉為 TXT 檔~\n\n\n# License\n\n蔡中涵委員 g0v 阿美語<em>萌</em><em>典</em>計劃使用本字<em>典</em>，以 CC BY-NC 授權宣告。\n</div>
            </div>

            <div className="result_row">
              <div className=""><a href="#" className="github_name">wildjcrt/moedict-extension</a></div>
              <div className="github_description">蔡中涵委員阿美語字典</div>
              <div className="highlighted_content"># amis-safolu\n\n感謝 cpyang 將 PDF 原稿轉為 TXT 檔~\n\n\n# License\n\n蔡中涵委員 g0v 阿美語<em>萌</em><em>典</em>計劃使用本字<em>典</em>，以 CC BY-NC 授權宣告。\n</div>
            </div>
          </section>

          <section className="tabbable WtabPage result_rows" id="fromHackpad">
            <div className="result_row">
              <div className=""><a href="#" className="hackpad_name">9 月萌典松: moed6ct 短講「萌典考」</a></div>
              <div className="highlighted_content">9 月<em>萌</em><em>典</em>松</div>
              <div className="highlighted_content">moed6ct 短講「<em>萌</em><em>典</em>考」目的將<em>萌</em><em>典</em>重要開發時刻與所解決的問題相連結，甚至標出與</div>
              <div className="highlighted_content">[COSCUP 2013] Audrey - <em>萌</em><em>典</em>與零時政府[漢字產業創意工作坊 20140726] Audrey - <em>萌</em><em>典</em>與零時政府</div>
            </div>
          </section>

          <section className="tabbable WtabPage result_rows" id="fromHackfoldr">
            <div className="result_row">
              <div className=""><a href="#" className="hackfoldr_name">tai5-uan5_gian5-gi2_phing5-thai5</a></div>
              <div className="highlighted_content">MoeDict - <em>萌</em><em>典</em></div>
            </div>
          </section>

          <div className="pagination text-align-center">
            <a href="#" className="pagination_button">0</a>
            <a href="#" className="pagination_button">1</a>
            <a href="#" className="pagination_button">2</a>
            <a href="#" className="pagination_button">3</a>
            <a href="#" className="pagination_button">4</a>
            <a href="#" className="pagination_button">5</a>
            <a href="#" className="pagination_button">6</a>
            <a href="#" className="pagination_button">7</a>
            <a href="#" className="pagination_button">8</a>
            <a href="#" className="pagination_button"></a>
          </div>
        </div>
      </div>
    </div>;
  }
}

export default Search;
